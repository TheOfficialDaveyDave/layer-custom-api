import type { UseFetchOptions } from "nuxt/app";
import { defu } from "defu";

export function useAPI<T>(url: string, options: UseFetchOptions<T> = {}) {
  const config = useRuntimeConfig();
  const cookieOptions = {
    domain: config.public.DOMAIN as string,
    secure: true,
    maxAge: 30 * 24 * 60 * 60,
  };

  const accessToken = useCookie("accessToken", cookieOptions).value;
  const retry = 0;

  const defaults: UseFetchOptions<T> = {
    baseURL: config.public.BASE_URL || "/",
    key: url,
    headers: { Authorization: `Bearer ${accessToken}` },
    async onResponseError({ response }) {
      if (response.status === 401 && !retry) {
        const refreshToken = useCookie("refreshToken", cookieOptions).value;
        const data = await useFetch("/api/auth/refresh-token", {
          method: "POST",
          body: { refreshToken: refreshToken },
        });

        useCookie("accessToken", cookieOptions).value = data.data.value as string;

        const params = defu(
          {
            ...options,
            headers: { Authorization: `Bearer ${res.data.accessToken}` },
          },
          defaults,
        );

        return useFetch(url, params);
      }
    },
  };

  const params = defu(options, defaults);

  return useFetch(url, params);
}
