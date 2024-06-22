export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const cookieOptions = {
    domain: config.public.DOMAIN as string,
    secure: true,
    maxAge: 30 * 24 * 60 * 60,
  };

  const api = $fetch.create({
    baseURL: '/',
    retry: 1,
    retryStatusCodes: [401],
    retryDelay: 500,
    onRequest({ options }) {
      const accessToken = useCookie('accessToken').value
      options.headers = accessToken ? { Authorization: `Bearer ${accessToken}` }
        : {}
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        await useFetch('/api/auth/refresh', {
          baseURL: "/",
          method: 'POST',
          server: false,
          credentials: 'include',
          body: JSON.stringify({ refreshToken: useCookie('refreshToken').value }),

          onResponse({ response }) {
            useCookie('accessToken', cookieOptions).value = response._data;
          },
        },
        )
      }
    }
  })

  // Expose to useNuxtApp().$api
  return {
    provide: {
      api
    }
  }
})
