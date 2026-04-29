const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      ...options.headers
    }
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/login";
    return;
  }

  return res;
};

export default authFetch;