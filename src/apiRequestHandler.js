import axios from 'axios'

const supportedMethods = ["get","post","put","delete"]

const apiRequestHandler = (
  method,
  resource,
  payload,
  callback,
  api = 'http://localhost:5000'
) => {
  console.log(`${api} - ${method} /${resource}`, {request: payload})

  if (!resource && resource !== "") {
    throw new Error(`Resource '${resource}' is not valid. Please enter an empty string if you want to access the root of the API. Endpoint: ${method} ${api}.`)
  }

  if (supportedMethods.indexOf(method) === -1) {
    throw new Error(`Method '${method}' is not supported by the API. The request method must be one of the following: '${supportedMethods.join('\', \'')}'. Endpoint: ${api}/${resource}`)
  }

  axios[method](
      `${api}/${resource}`,
      method !== "get" && method !== "delete" ? {...payload} : {params: payload}
    )
    .then((response) => {
      console.log(`${api} - ${method} /${resource}`, {response: response.data})

      if (response.data && method === 'get') {
        let debugDataTable = []
        let done = false
        let arrayName = undefined
        Object.keys(response.data).map(key => {
          if (!done) {
            if (key !== 'feedback' && response.data[key].map) {
              arrayName = key
              debugDataTable = response.data[key].map(item => item)
              done = true
              if (debugDataTable.length > 0) {
                console.log(`${api} - ${method} /${resource} > response: table representation of array '${arrayName}'`)
                console.table(debugDataTable)
              }
              
            }

          }

          return null
        })
      }

      if (callback) {
        callback(response.data)
      }

    })

}

export default apiRequestHandler