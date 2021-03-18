import {
  DeletePostMutationVariables,
  DootMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation
} from '@generated/graphql'
import { Cache, cacheExchange, Resolver } from '@urql/exchange-graphcache'
import gql from 'graphql-tag'
import Router from 'next/router'
import {
  dedupExchange,
  Exchange,
  fetchExchange,
  stringifyVariables
} from 'urql'
import { pipe, tap } from 'wonka'
import { betterUpdateQuery } from './betterUpdateQuery'
import { isServer } from './isServer'

const errorExchange: Exchange = ({ forward }) => (ops$) => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace('/login')
      }
    })
  )
}

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info

    const allFields = cache.inspectFields(entityKey)
    const fieldInfos = allFields.filter((info) => info.fieldName === fieldName)

    const size = fieldInfos.length
    if (size === 0) {
      return undefined
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const isItInTheCache = cache.resolve(
      cache.resolve(entityKey, fieldKey) as string,
      'posts'
    )
    info.partial = !isItInTheCache

    let hasMore = true
    const results: string[] = []

    fieldInfos.forEach((fi) => {
      const key = cache.resolve(entityKey, fi.fieldKey) as string
      const data = cache.resolve(key, 'posts') as string[]
      const _hasMore = cache.resolve(key, 'hasMore')
      if (!_hasMore) {
        hasMore = _hasMore as boolean
      }
      results.push(...data)
    })

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    }
  }
}

const invalidateAllPosts = (cache: Cache) => {
  // invalidate all queries associated with 'posts'
  const allFields = cache.inspectFields('Query')
  const fieldInfos = allFields.filter((info) => info.fieldName === 'posts')
  // encompass all arguments of this query when invalidating
  fieldInfos.forEach((fi) => {
    cache.invalidate('Query', 'posts', fi.arguments || {})
  })
}

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie
  if (isServer()) {
    cookie = ctx?.req.headers.cookie
  }

  return {
    url: 'http://localhost:4000/graphql',
    fetchOptions: {
      credentials: 'include',
      headers: cookie
        ? {
            cookie
          }
        : undefined
    } as const,
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null
        },
        resolvers: {
          Query: {
            posts: cursorPagination()
          }
        },
        updates: {
          Mutation: {
            register: (_result, _args, cache, _info) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) {
                    return query
                  } else {
                    return {
                      me: result.register.user
                    }
                  }
                }
              )
            },

            login: (_result, _args, cache, _info) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) {
                    return query
                  } else {
                    return {
                      me: result.login.user
                    }
                  }
                }
              )
              invalidateAllPosts(cache)
            },

            logout: (_result, _args, cache, _info) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              )
            },

            createPost: (_result, _args, cache, _info) => {
              invalidateAllPosts(cache)
            },

            deletePost: (_result, args, cache, _info) => {
              cache.invalidate({
                __typename: 'Post',
                id: (args as DeletePostMutationVariables).id
              })
            },

            doot: (_result, args, cache, _info) => {
              const { postId, value } = args as DootMutationVariables
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    dootStatus
                  }
                `,
                { id: postId } as any
              )
              if (data) {
                if (data.dootStatus === args.value) return
                const newPoints =
                  (data.points as number) + (!data.dootStatus ? 1 : 2) * value
                cache.writeFragment(
                  gql`
                    fragment _ on Post {
                      points
                      dootStatus
                    }
                  `,
                  { id: postId, points: newPoints, dootStatus: value } as any
                )
              }
            }
          }
        }
      }),
      errorExchange,
      ssrExchange,
      fetchExchange
    ]
  }
}
