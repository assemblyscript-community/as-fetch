// JS Fetch Bindings
declare function _fetch(url: string, method: string, mode: string, body: Uint8Array, headers: string, pointer: i32, id: number): void

const Uint8Array_ID = idof<Uint8Array>()

// Module Imports
import { RequestInit, Response, Headers} from './'

import { isNull } from './util'

function fetchBindings(url: string, method: string, mode: string, body: Uint8Array, headers: string, callback: (body: Uint8Array, status: number, url: string, redirected: i32) => void): void {

  _fetch(url, method, mode, body, headers, load<i32>(changetype<usize>(callback)), Uint8Array_ID)

}

const _thenPointers: Array<i32> = []

const _catchPointers: Array<i32> = []

export class Fetch {
  constructor(url: string, init: RequestInit) {

    const body = isNull(init.body) ? new Uint8Array(0) : Uint8Array.wrap(changetype<ArrayBuffer>(init.body))
    
    const headers = isNull(init.headers) ? [['']] : changetype<Array<Array<string>>>(init.headers)

    const method = isNull(init.method) ? 'GET' : changetype<string>(init.method)

    const mode = isNull(init.mode) ? '' : changetype<string>(init.mode)

    let headersString = ''

    if (headers.length > 0) {

      for (let i = 0; i < headers.length; i++) {
        const header = headers[i]
        headersString += `,["${header[0]}","${header[1]}"]`
      }

    }

    fetchBindings(url, method, mode, body, headersString, (body, status, url, redirected) => {

      const headerList = new Headers()
  
      const request = new Response(body.buffer, {
        status: status,
        headers: headerList,
        url: url,
        redirected: (redirected === 0) ? false : true
        // Better to return numbers
      })
    
      for (let i = 0; i < _thenPointers.length; i++) {
        const pointer = _thenPointers[i]
        call_indirect(pointer, request)
      }
  
    })

  }
  then(onfulfilled: (value: Response) => void): Fetch {
    _thenPointers.push(load<i32>(changetype<usize>(onfulfilled)))
    return this
  }
}

export function fetch(url: string, init: RequestInit): Fetch {

  return new Fetch(url, init)

}