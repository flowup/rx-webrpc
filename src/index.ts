import { grpc, BrowserHeaders } from 'grpc-web-client';
import { Observable } from 'rxjs';
import * as jspb from 'google-protobuf';

export interface RPCResponse<R> {
  headers: BrowserHeaders;
  trailers: BrowserHeaders;
  value: R;
  code: grpc.Code;
  message: string;
}

export interface RPCOpts {
  host: string;
  headers?: BrowserHeaders;
  debug?: boolean;
}

export function toMessage<T>(obj: any, to: { new(): T; }): T {
  const res = new to();
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    // create setter
    const setter = 'set' + key.substr(0, 1).toUpperCase() + key.substr(1);
    if (!res[setter]) {
      throw new TypeError(`No setter found for a given RPC message: ${setter}`);
    }

    // invoke setting function with the value
    res[setter](obj[key])
  }

  return res;
}

export class RPCProvider {
  constructor(private opts: RPCOpts) {
  }

  call<TReq extends jspb.Message, TRes extends jspb.Message>(method: grpc.MethodDefinition<TReq, TRes>,
                                                             req: TReq, opts?: RPCOpts): Observable<RPCResponse<TRes>> {
    return call<TReq, TRes>(method, opts || this.opts, req);
  }
}

export function createRPCProvider(opts: RPCOpts): RPCProvider {
  return new RPCProvider(opts);
}

export function call<TReq extends jspb.Message, TRes extends jspb.Message>(method: grpc.MethodDefinition<TReq, TRes>, opts: RPCOpts,
                                                                           req: TReq): Observable<RPCResponse<TRes>> {

  return Observable.create(sub => {
    const response: RPCResponse<TRes> = <RPCResponse<TRes>>{};

    grpc.invoke(method, {
      request: req,
      host: opts.host,
      headers: opts.headers,
      debug: opts.debug,

      onHeaders: (headers: BrowserHeaders) => {
        response.headers = headers;
      },
      onMessage: (message: any) => {
        response.value = message.toObject();
      },
      onEnd: (code: grpc.Code, msg: string, trailers: BrowserHeaders) => {
        response.code = code;
        response.message = msg;
        response.trailers = trailers;

        sub.next(response);
        sub.complete();
      }
    });
  })
}