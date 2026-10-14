export const getAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("accessToken");
};

export const getAuthHeaders = () => {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAuthJsonHeaders = () => {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};