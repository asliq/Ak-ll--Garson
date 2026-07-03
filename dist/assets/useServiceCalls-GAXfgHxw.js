import{c as r,s as n,t,z as a}from"./index-CuyAyiXt.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const u=r("MessageSquare",[["path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",key:"1lielz"}]]),l={all:["serviceCalls"]};function i(){const s=n();return t({mutationFn:async e=>{throw new Error("SERVICE_CALLS_DISABLED")},onSuccess:()=>{s.invalidateQueries({queryKey:l.all})},onError:e=>{if((e==null?void 0:e.message)==="SERVICE_CALLS_DISABLED"){a("Garson çağırma şu an kullanılamıyor",{icon:"ℹ️"});return}a.error("Talep gönderilemedi")}})}export{u as M,i as u};
