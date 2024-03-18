
const domainRegex = /^(http|https):\/\/(([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}|(\d{1,3}\.){3}\d{1,3}(:\d{1,5})?)$/
const apiPathRegex = /^\/[a-zA-Z0-9\/_-]*$/;


export const getValidDomain = (str: string = '') => {
  const validDomainList = [...new Set(str.split(',').filter(item => domainRegex.test(item)))];
  return validDomainList;
}

export const getValidApiPath = (str: string = '') => {
  const validApiList = [...new Set(str.split(',').filter(item => apiPathRegex.test(item)))];
  return validApiList;
}