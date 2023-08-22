const DEFAULT_PAGE_NUMBER = 1;
//In mongo returns all docs if the limit is 0
const DEFAULT_PAGE_LIMIT = 0;

function getPagination(query) {
  /*abs() returns just positives numbers even a negative 
    one is introduced*/
  const page = Math.abs(query.page) || DEFAULT_PAGE_NUMBER;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  const skip = (page -1) * limit;
  return {
    skip,
    limit
  };
}

module.exports = {
  getPagination
}