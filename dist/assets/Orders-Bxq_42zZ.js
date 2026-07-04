import{c as z,k as ve,l as K,n as G,o as te,t as se,z as T,e as be,r as p,s as ge,j as e,X as ne,p as V,d as Ne,q as Me,v as Se,w as ke,R as Be,b as ae,x as ie,g as re,y as Ce,C as we,f as Te,A as $e,m as J}from"./index-DjC6P37z.js";import{u as Ie}from"./useMenu-DDTkUGv8.js";import{u as Pe}from"./useTranslation-DNJ4tbuf.js";import{C as ze}from"./circle-x-CpPa2Wox.js";import{U as Ae}from"./user-CkhKHg_m.js";import{W as Fe}from"./wallet-ChmCLRmm.js";import{R as Ee}from"./receipt-eKRPFN2r.js";import{D as le}from"./dollar-sign-cDMr8XYo.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Le=z("Banknote",[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"2",key:"9lu3g6"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M6 12h.01M18 12h.01",key:"113zkx"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const De=z("Calculator",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=z("Merge",[["path",{d:"m8 6 4-4 4 4",key:"ybng9g"}],["path",{d:"M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22",key:"1hyw0i"}],["path",{d:"m20 22-5-5",key:"1m27yz"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=z("Percent",[["line",{x1:"19",x2:"5",y1:"5",y2:"19",key:"1x9vlm"}],["circle",{cx:"6.5",cy:"6.5",r:"2.5",key:"4mh3h7"}],["circle",{cx:"17.5",cy:"17.5",r:"2.5",key:"1mdrzq"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const qe=z("Printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=z("Split",[["path",{d:"M16 3h5v5",key:"1806ms"}],["path",{d:"M8 3H3v5",key:"15dfkv"}],["path",{d:"M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3",key:"1qrqzj"}],["path",{d:"m15 9 6-6",key:"ko1vev"}]]),b={all:["tables"],lists:()=>[...b.all,"list"],list:n=>[...b.lists(),{filters:n}],details:()=>[...b.all,"detail"],detail:n=>[...b.details(),n]};function He(n={}){return ve({queryKey:b.lists(),queryFn:se.getAll,enabled:te.tables,staleTime:1e3*60*2,retry:!1,...n})}function Oe(){const n=K();return G({mutationFn:se.updateStatus,onMutate:async({id:r,status:a})=>{await n.cancelQueries({queryKey:b.lists()});const o=n.getQueryData(b.lists());return n.setQueryData(b.lists(),d=>d==null?void 0:d.map(m=>m.id===r?{...m,status:a}:m)),{previousTables:o}},onError:(r,a,o)=>{n.setQueryData(b.lists(),o==null?void 0:o.previousTables),T.error("Masa durumu güncellenemedi!")},onSuccess:r=>{const a={available:"Boş",occupied:"Dolu",reserved:"Rezerve"};T.success(`Masa ${r.number} - ${a[r.status]}`)},onSettled:()=>{n.invalidateQueries({queryKey:b.lists()})}})}const oe={all:["payments"]};function Qe(){const n=K();return G({mutationFn:async r=>{throw new Error("PAYMENTS_DISABLED")},onSuccess:r=>{n.invalidateQueries({queryKey:oe.all}),n.invalidateQueries({queryKey:["orders"]}),n.setQueryData(["tables","list"],o=>o==null?void 0:o.map(d=>d.id===r.tableId?{...d,status:"available"}:d)),n.invalidateQueries({queryKey:["tables"]});const a={cash:"Nakit",credit_card:"Kredi Kartı",debit_card:"Banka Kartı",mobile:"Mobil Ödeme",online:"Online"};T.success(`Ödeme alındı: ₺${r.amount+(r.tip||0)} (${a[r.method]})`,{icon:"💳",duration:4e3})},onError:r=>{(r==null?void 0:r.message)!=="PAYMENTS_DISABLED"&&T.error("Ödeme işlemi başarısız!")}})}function Ke(){const n=K();return G({mutationFn:async r=>{throw new Error("PAYMENTS_DISABLED")},onSuccess:(r,{tableId:a})=>{n.invalidateQueries({queryKey:oe.all}),n.invalidateQueries({queryKey:["orders"]}),n.invalidateQueries({queryKey:["tables"]}),T.success(`${r.length} parça halinde ödeme alındı`,{icon:"💳"})},onError:r=>{(r==null?void 0:r.message)!=="PAYMENTS_DISABLED"&&T.error("Bölünmüş ödeme işlemi başarısız!")}})}const Ge=(n,r,a)=>{const o=window.open("","_blank");if(!o){alert("Lütfen tarayıcınızda pop-up engelleyiciyi kapatın");return}const d=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fiş - Masa ${r.number}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          padding: 20px;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px dashed #000;
          padding-bottom: 15px;
        }
        
        .restaurant-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .date {
          font-size: 12px;
          color: #666;
          margin-top: 10px;
        }
        
        .table-info {
          margin: 15px 0;
          padding: 10px 0;
          border-bottom: 1px dashed #000;
        }
        
        .table-info div {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 14px;
        }
        
        .items {
          margin: 15px 0;
        }
        
        .item {
          margin: 10px 0;
          font-size: 14px;
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }
        
        .item-notes {
          font-size: 12px;
          color: #666;
          margin-top: 3px;
          padding-left: 10px;
        }
        
        .totals {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed #000;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          font-size: 14px;
        }
        
        .total-row.grand-total {
          font-size: 18px;
          font-weight: bold;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #000;
        }
        
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          border-top: 2px dashed #000;
          padding-top: 15px;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        @media print {
          body {
            padding: 10px;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="restaurant-name">${a==null?void 0:a.name}</div>
        <div>${(a==null?void 0:a.address)||""}</div>
        <div>${(a==null?void 0:a.phone)||""}</div>
        <div class="date">${new Date().toLocaleString("tr-TR")}</div>
      </div>
      
      <div class="table-info">
        <div>
          <span>Masa:</span>
          <strong>Masa ${r.number}</span>
        </div>
        <div>
          <span>Garson:</span>
          <span>${n.waiterName||"Garson"}</span>
        </div>
        <div>
          <span>Sipariş No:</span>
          <span>${n.id}</span>
        </div>
      </div>
      
      <div class="items">
        ${n.items.map(m=>`
          <div class="item">
            <div class="item-header">
              <span>${m.quantity}x ${m.name}</span>
              <span>₺${(m.price*m.quantity).toFixed(2)}</span>
            </div>
            ${m.notes?`<div class="item-notes">Not: ${m.notes}</div>`:""}
          </div>
        `).join("")}
      </div>
      
      <div class="totals">
        <div class="total-row">
          <span>Ara Toplam:</span>
          <span>₺${(n.subtotal||n.totalAmount).toFixed(2)}</span>
        </div>
        ${n.discountAmount>0?`
          <div class="total-row" style="color: #22c55e;">
            <span>İndirim:</span>
            <span>-₺${n.discountAmount.toFixed(2)}</span>
          </div>
        `:""}
        <div class="total-row grand-total">
          <span>TOPLAM:</span>
          <span>₺${n.totalAmount.toFixed(2)}</span>
        </div>
      </div>
      
      <div class="footer">
        <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
        <p>Afiyet olsun! 🍽️</p>
      </div>
      
      <script>
        window.onload = function() {
          window.print()
          setTimeout(() => window.close(), 500)
        }
      <\/script>
    </body>
    </html>
  `;o.document.write(d),o.document.close()};function Ye(){const n=be(a=>a.soundEnabled);return{play:p.useCallback(a=>{if(!n)return;const o=ge[a];o&&o()},[n])}}const We="_overlay_1dy4n_3",Ue="_modal_1dy4n_16",Xe="_header_1dy4n_44",Ve="_closeBtn_1dy4n_58",Je="_currentInfo_1dy4n_75",Ze="_infoCard_1dy4n_81",et="_tabs_1dy4n_96",tt="_tab_1dy4n_96",st="_active_1dy4n_123",nt="_content_1dy4n_129",at="_description_1dy4n_135",it="_tableGrid_1dy4n_142",rt="_tableBtn_1dy4n_149",lt="_selected_1dy4n_165",ot="_actionBtn_1dy4n_176",ct="_splitModes_1dy4n_203",dt="_modeBtn_1dy4n_210",mt="_splitControl_1dy4n_235",pt="_counterControl_1dy4n_247",ut="_splitPreview_1dy4n_280",xt="_previewLabel_1dy4n_291",yt="_previewAmount_1dy4n_297",ht="_customSplit_1dy4n_303",_t="_splitInput_1dy4n_310",ft="_splitSummary_1dy4n_337",i={overlay:We,modal:Ue,header:Xe,closeBtn:Ve,currentInfo:Je,infoCard:Ze,tabs:et,tab:tt,active:st,content:nt,description:at,tableGrid:it,tableBtn:rt,selected:lt,actionBtn:ot,splitModes:ct,modeBtn:dt,splitControl:mt,counterControl:pt,splitPreview:ut,previewLabel:xt,previewAmount:yt,customSplit:ht,splitInput:_t,splitSummary:ft},P=n=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:0}).format(n);function jt({isOpen:n,onClose:r,currentTable:a,availableTables:o,order:d,onTransfer:m,onMerge:M,onSplit:$}){const[y,C]=p.useState("transfer"),[h,w]=p.useState(null),[u,S]=p.useState(2),[x,I]=p.useState([]);if(!n||!a||!d)return null;const k=()=>{if(!h){alert("Lütfen hedef masa seçin");return}m(a.id,h),r()},D=()=>{if(!h){alert("Lütfen birleştirilecek masayı seçin");return}M(a.id,h),r()},R=()=>{const l=d.total/u;$(d.id,Array(u).fill(l)),r()},A=()=>{const l=x.reduce((j,v)=>j+(parseFloat(v)||0),0);if(Math.abs(l-d.total)>.01){alert(`Toplam ${P(d.total)} olmalı. Şu an: ${P(l)}`);return}$(d.id,x.map(j=>parseFloat(j))),r()};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:i.overlay,onClick:r}),e.jsxs("div",{className:i.modal,children:[e.jsxs("div",{className:i.header,children:[e.jsx("h2",{children:"Masa İşlemleri"}),e.jsx("button",{className:i.closeBtn,onClick:r,children:e.jsx(ne,{size:20})})]}),e.jsx("div",{className:i.currentInfo,children:e.jsxs("div",{className:i.infoCard,children:[e.jsxs("span",{children:["Masa ",a.number]}),e.jsx("strong",{children:P(d.total)})]})}),e.jsxs("div",{className:i.tabs,children:[e.jsxs("button",{className:`${i.tab} ${y==="transfer"?i.active:""}`,onClick:()=>C("transfer"),children:[e.jsx(V,{size:18}),"Transfer"]}),e.jsxs("button",{className:`${i.tab} ${y==="merge"?i.active:""}`,onClick:()=>C("merge"),children:[e.jsx(Z,{size:18}),"Birleştir"]}),e.jsxs("button",{className:`${i.tab} ${y==="split"?i.active:""}`,onClick:()=>C("split"),children:[e.jsx(E,{size:18}),"Hesap Böl"]})]}),e.jsxs("div",{className:i.content,children:[y==="transfer"&&e.jsxs("div",{className:i.transferSection,children:[e.jsxs("p",{className:i.description,children:["Masa ",a.number,"'deki siparişi başka bir masaya taşıyın"]}),e.jsx("div",{className:i.tableGrid,children:o==null?void 0:o.map(l=>e.jsxs("button",{className:`${i.tableBtn} ${h===l.id?i.selected:""}`,onClick:()=>w(l.id),disabled:l.id===a.id,children:["Masa ",l.number]},l.id))}),e.jsxs("button",{className:i.actionBtn,onClick:k,disabled:!h,children:[e.jsx(V,{size:18}),"Transfer Et"]})]}),y==="merge"&&e.jsxs("div",{className:i.mergeSection,children:[e.jsxs("p",{className:i.description,children:["Masa ",a.number,"'ü başka bir masa ile birleştirin"]}),e.jsx("div",{className:i.tableGrid,children:o==null?void 0:o.filter(l=>l.status==="occupied").map(l=>e.jsxs("button",{className:`${i.tableBtn} ${h===l.id?i.selected:""}`,onClick:()=>w(l.id),disabled:l.id===a.id,children:["Masa ",l.number]},l.id))}),e.jsxs("button",{className:i.actionBtn,onClick:D,disabled:!h,children:[e.jsx(Z,{size:18}),"Masaları Birleştir"]})]}),y==="split"&&e.jsxs("div",{className:i.splitSection,children:[e.jsxs("div",{className:i.splitModes,children:[e.jsxs("button",{className:`${i.modeBtn} ${x.length?"":i.active}`,onClick:()=>I([]),children:[e.jsx(De,{size:18}),"Eşit Böl"]}),e.jsxs("button",{className:`${i.modeBtn} ${x.length?i.active:""}`,onClick:()=>{const l=Array(u).fill("");I(l)},children:[e.jsx(E,{size:18}),"Özel Böl"]})]}),x.length?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:i.customSplit,children:x.map((l,j)=>e.jsxs("div",{className:i.splitInput,children:[e.jsxs("label",{children:["Kişi ",j+1]}),e.jsx("input",{type:"number",value:l,onChange:v=>{const g=[...x];g[j]=v.target.value,I(g)},placeholder:"0.00"})]},j))}),e.jsxs("div",{className:i.splitSummary,children:[e.jsxs("div",{children:["Toplam: ",P(x.reduce((l,j)=>l+(parseFloat(j)||0),0))]}),e.jsxs("div",{children:["Hedef: ",P(d.total)]})]}),e.jsxs("button",{className:i.actionBtn,onClick:A,children:[e.jsx(E,{size:18}),"Hesabı Böl"]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:i.splitControl,children:[e.jsx("label",{children:"Kaç kişiye bölünsün?"}),e.jsxs("div",{className:i.counterControl,children:[e.jsx("button",{onClick:()=>S(Math.max(2,u-1)),children:"-"}),e.jsx("span",{children:u}),e.jsx("button",{onClick:()=>S(Math.min(10,u+1)),children:"+"})]})]}),e.jsxs("div",{className:i.splitPreview,children:[e.jsx("div",{className:i.previewLabel,children:"Kişi başı:"}),e.jsx("div",{className:i.previewAmount,children:P(d.total/u)})]}),e.jsxs("button",{className:i.actionBtn,onClick:R,children:[e.jsx(E,{size:18}),"Eşit Böl (",u," Kişi)"]})]})]})]})]})]})}const vt="_orders_1xtfs_3",bt="_ordersHeader_1xtfs_10",gt="_refreshBtn_1xtfs_28",Nt="_spinning_1xtfs_48",Mt="_spin_1xtfs_48",St="_printBtn_1xtfs_52",kt="_filters_1xtfs_77",Bt="_filterBtn_1xtfs_83",Ct="_active_1xtfs_100",wt="_ordersList_1xtfs_107",Tt="_orderCard_1xtfs_114",$t="_orderHeader_1xtfs_127",It="_orderInfo_1xtfs_136",Pt="_orderNumber_1xtfs_140",zt="_orderMeta_1xtfs_147",At="_orderTable_1xtfs_155",Ft="_orderTime_1xtfs_159",Et="_orderWaiter_1xtfs_160",Lt="_orderSep_1xtfs_166",Dt="_orderStatus_1xtfs_170",Rt="_warning_1xtfs_180",qt="_info_1xtfs_185",Ht="_success_1xtfs_190",Ot="_danger_1xtfs_195",Qt="_orderItems_1xtfs_201",Kt="_orderItem_1xtfs_201",Gt="_itemQuantity_1xtfs_218",Yt="_itemName_1xtfs_224",Wt="_itemPrice_1xtfs_229",Ut="_orderFooter_1xtfs_235",Xt="_orderTotal_1xtfs_244",Vt="_orderActions_1xtfs_260",Jt="_actionBtn_1xtfs_265",Zt="_primary_1xtfs_275",es="_emptyState_1xtfs_304",ts="_payment_1xtfs_327",ss="_paymentBadge_1xtfs_340",ns="_modalOverlay_1xtfs_350",as="_paymentModal_1xtfs_357",is="_paymentModalHeader_1xtfs_375",rs="_paymentModalTitle_1xtfs_381",ls="_modalCloseBtn_1xtfs_399",os="_paymentItems_1xtfs_415",cs="_paymentItem_1xtfs_415",ds="_paymentItemQty_1xtfs_432",ms="_paymentItemName_1xtfs_438",ps="_paymentItemPrice_1xtfs_443",us="_paymentTotal_1xtfs_448",xs="_paymentMethodSection_1xtfs_464",ys="_paymentMethodLabel_1xtfs_470",hs="_paymentMethodGrid_1xtfs_477",_s="_paymentMethodBtn_1xtfs_483",fs="_selected_1xtfs_505",js="_confirmPaymentBtn_1xtfs_512",vs="_paymentSummaryRows_1xtfs_539",bs="_paymentSummaryRow_1xtfs_539",gs="_discountAmount_1xtfs_555",Ns="_extraPaymentFields_1xtfs_557",Ms="_extraField_1xtfs_563",Ss="_splitToggle_1xtfs_587",ks="_splitToggleBtn_1xtfs_593",Bs="_splitControl_1xtfs_614",Cs="_splitPerPerson_1xtfs_632",t={orders:vt,ordersHeader:bt,refreshBtn:gt,spinning:Nt,spin:Mt,printBtn:St,filters:kt,filterBtn:Bt,active:Ct,ordersList:wt,orderCard:Tt,orderHeader:$t,orderInfo:It,orderNumber:Pt,orderMeta:zt,orderTable:At,orderTime:Ft,orderWaiter:Et,orderSep:Lt,orderStatus:Dt,warning:Rt,info:qt,success:Ht,danger:Ot,orderItems:Qt,orderItem:Kt,itemQuantity:Gt,itemName:Yt,itemPrice:Wt,orderFooter:Ut,orderTotal:Xt,orderActions:Vt,actionBtn:Jt,primary:Zt,emptyState:es,payment:ts,paymentBadge:ss,modalOverlay:ns,paymentModal:as,paymentModalHeader:is,paymentModalTitle:rs,modalCloseBtn:ls,paymentItems:os,paymentItem:cs,paymentItemQty:ds,paymentItemName:ms,paymentItemPrice:ps,paymentTotal:us,paymentMethodSection:xs,paymentMethodLabel:ys,paymentMethodGrid:hs,paymentMethodBtn:_s,selected:fs,confirmPaymentBtn:js,paymentSummaryRows:vs,paymentSummaryRow:bs,discountAmount:gs,extraPaymentFields:Ns,extraField:Ms,splitToggle:Ss,splitToggleBtn:ks,splitControl:Bs,splitPerPerson:Cs},ee={pending:{label:"Bekliyor",icon:ae,color:"warning"},preparing:{label:"Hazırlanıyor",icon:we,color:"info"},ready:{label:"Hazır",icon:Ce,color:"success"},served:{label:"Servis Edildi",icon:re,color:"success"},completed:{label:"Tamamlandı",icon:ie,color:"success"},cancelled:{label:"İptal",icon:ze,color:"danger"}},ws=[{id:"cash",label:"Nakit",icon:Le,apiMethod:"cash"},{id:"card",label:"Kart",icon:ie,apiMethod:"credit_card"},{id:"online",label:"Online",icon:le,apiMethod:"mobile"}],N=n=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:0}).format(n),Ts=n=>new Date(n).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});function Ds(){const[n,r]=p.useState("all"),[a,o]=p.useState(null),[d,m]=p.useState("cash"),[M,$]=p.useState(0),[y,C]=p.useState(0),[h,w]=p.useState(!1),[u,S]=p.useState(2),[x,I]=p.useState(null),{data:k,isLoading:D,isError:R,error:A,refetch:l,isRefetching:j}=Ne(),{data:v}=He(),{data:g}=Ie(),L=Me();Oe();const ce=Qe(),de=Ke();Se(),ke();const{play:me}=Ye(),{t:F}=Pe(),q=(k==null?void 0:k.filter(s=>n==="all"?!0:n==="active"?["pending","preparing","ready","served"].includes(s.status):s.status===n).sort((s,c)=>new Date(c.createdAt)-new Date(s.createdAt)))||[],H=p.useMemo(()=>{if(!a)return 0;const s=a.total*(M/100);return Math.max(0,a.total-s+y)},[a,M,y]),O=()=>{o(null),m("cash"),$(0),C(0),w(!1),S(2)},Y=s=>{o(s),m("cash"),$(0),C(0),w(!1),S(2)},Q=(s,c)=>{L.mutate({id:s,status:c})},pe=s=>{window.confirm("Siparişi iptal etmek istediğinize emin misiniz?")&&L.mutate({id:s,status:"cancelled"})},ue=()=>{L.mutate({id:a.id,status:"completed"},{onSuccess:()=>{me("payment"),O(),T.success("Sipariş tamamlandı")}})},xe=()=>{if(a){ue();return}},W=s=>{const c=v==null?void 0:v.find(_=>_.id==s);return c?c.number:s?String(s).slice(-4):"?"},U=s=>{const c=g==null?void 0:g.find(_=>_.id==s);return c?c.name:"Bilinmeyen Ürün"},ye=s=>{const c=(v==null?void 0:v.find(f=>f.id==s.tableId))||{number:s.tableId},_={...s,items:(s.items||[]).map(f=>{const B=g==null?void 0:g.find(je=>je.id==f.menuItemId);return{...f,name:(B==null?void 0:B.name)||"Ürün",price:f.price||(B==null?void 0:B.price)||0}})};Ge(_,c,{name:"Lezzet Durağı"})},he=(s,c)=>{},_e=(s,c)=>{},fe=(s,c)=>{const _=k==null?void 0:k.find(f=>f.id===s);_&&(Y(_),w(!0),S(c.length),I(null))},X=ce.isPending||de.isPending||L.isPending;return D?e.jsx("div",{className:t.orders,children:"Yükleniyor..."}):R?e.jsxs("div",{className:t.orders,children:[e.jsx("p",{children:"Siparişler yüklenemedi."}),e.jsx("p",{children:A==null?void 0:A.message}),e.jsx("button",{type:"button",onClick:()=>l(),children:"Tekrar Dene"})]}):e.jsxs("div",{className:t.orders,children:[e.jsxs("div",{className:t.ordersHeader,children:[e.jsxs("div",{children:[e.jsx("h1",{children:F("orders.title")}),e.jsxs("p",{children:[q.length," sipariş"]})]}),e.jsx("button",{className:`${t.refreshBtn} ${j?t.spinning:""}`,onClick:()=>l(),children:e.jsx(Be,{size:18})})]}),e.jsx("div",{className:t.filters,children:[{key:"all",label:"Tümü"},{key:"active",label:"Aktif"},{key:"pending",label:F("orders.statuses.pending")},{key:"preparing",label:F("orders.statuses.preparing")},{key:"ready",label:F("orders.statuses.ready")},{key:"completed",label:F("orders.statuses.completed")}].map(({key:s,label:c})=>e.jsx("button",{className:`${t.filterBtn} ${n===s?t.active:""}`,onClick:()=>r(s),children:c},s))}),e.jsx("div",{className:t.ordersList,children:q.length===0?e.jsxs("div",{className:t.emptyState,children:[e.jsx(ae,{size:48}),e.jsx("h3",{children:"Sipariş bulunamadı"}),e.jsx("p",{children:"Seçili filtreye uygun sipariş yok"})]}):q.map(s=>{const c=ee[s.status]||ee.pending,_=c.icon;return e.jsxs("div",{className:t.orderCard,children:[e.jsxs("div",{className:t.orderHeader,children:[e.jsxs("div",{className:t.orderInfo,children:[e.jsxs("div",{className:t.orderNumber,children:["Sipariş #",s.id]}),e.jsxs("div",{className:t.orderMeta,children:[e.jsxs("span",{className:t.orderTable,children:["Masa ",W(s.tableId)]}),e.jsx("span",{className:t.orderSep,children:"•"}),e.jsxs("span",{className:t.orderTime,children:[e.jsx(Te,{size:14}),Ts(s.createdAt)]}),s.waiter&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:t.orderSep,children:"•"}),e.jsxs("span",{className:t.orderWaiter,children:[e.jsx(Ae,{size:14}),s.waiter]})]})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[te.tables,e.jsx("button",{className:t.printBtn,onClick:()=>ye(s),title:"Fiş Yazdır",children:e.jsx(qe,{size:16})}),e.jsxs("div",{className:`${t.orderStatus} ${t[c.color]}`,children:[e.jsx(_,{size:16}),e.jsx("span",{children:c.label})]})]})]}),e.jsx("div",{className:t.orderItems,children:(s.items||[]).map((f,B)=>e.jsxs("div",{className:t.orderItem,children:[e.jsxs("span",{className:t.itemQuantity,children:[f.quantity,"x"]}),e.jsx("span",{className:t.itemName,children:U(f.menuItemId)}),e.jsx("span",{className:t.itemPrice,children:N(f.price*f.quantity)})]},B))}),e.jsxs("div",{className:t.orderFooter,children:[e.jsxs("div",{className:t.orderTotal,children:[e.jsx("span",{children:"Toplam:"}),e.jsx("strong",{children:N(s.total)})]}),e.jsxs("div",{className:t.orderActions,children:[s.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:`${t.actionBtn} ${t.primary}`,onClick:()=>Q(s.id,"preparing"),children:"Hazırlamaya Başla"}),e.jsx("button",{className:`${t.actionBtn} ${t.danger}`,onClick:()=>pe(s.id),children:"İptal"})]}),s.status==="preparing"&&e.jsx("button",{className:`${t.actionBtn} ${t.success}`,onClick:()=>Q(s.id,"ready"),children:"Hazır"}),s.status==="ready"&&e.jsx("button",{className:`${t.actionBtn} ${t.success}`,onClick:()=>Q(s.id,"served"),children:"Servis Et"}),s.status==="served"&&e.jsxs("button",{className:`${t.actionBtn} ${t.payment}`,onClick:()=>Y(s),children:[e.jsx(Fe,{size:16})," Ödeme Al"]}),s.status==="completed"&&s.paymentMethod&&e.jsx("span",{className:t.paymentBadge,children:s.paymentMethod==="cash"?"💵 Nakit":s.paymentMethod==="card"?"💳 Kart":"📱 Online"})]})]})]},s.id)})}),x&&e.jsx(jt,{isOpen:!!x,onClose:()=>I(null),currentTable:x.table,availableTables:v,order:x.order,onTransfer:_e,onMerge:he,onSplit:fe}),e.jsx($e,{children:a&&e.jsxs(e.Fragment,{children:[e.jsx(J.div,{className:t.modalOverlay,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:O}),e.jsxs(J.div,{className:t.paymentModal,initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},children:[e.jsxs("div",{className:t.paymentModalHeader,children:[e.jsxs("div",{className:t.paymentModalTitle,children:[e.jsx(Ee,{size:22}),e.jsxs("div",{children:[e.jsx("h2",{children:"Ödeme Al"}),e.jsxs("p",{children:["Sipariş #",a.id," • Masa ",W(a.tableId)]})]})]}),e.jsx("button",{className:t.modalCloseBtn,onClick:O,children:e.jsx(ne,{size:20})})]}),e.jsxs("div",{className:t.paymentItems,children:[(a.items||[]).map((s,c)=>e.jsxs("div",{className:t.paymentItem,children:[e.jsxs("span",{className:t.paymentItemQty,children:[s.quantity,"x"]}),e.jsx("span",{className:t.paymentItemName,children:U(s.menuItemId)}),e.jsx("span",{className:t.paymentItemPrice,children:N(s.price*s.quantity)})]},c)),e.jsxs("div",{className:t.paymentSummaryRows,children:[e.jsxs("div",{className:t.paymentSummaryRow,children:[e.jsx("span",{children:"Ara Toplam"}),e.jsx("span",{children:N(a.total)})]}),M>0&&e.jsxs("div",{className:t.paymentSummaryRow,children:[e.jsxs("span",{children:["İndirim (%",M,")"]}),e.jsxs("span",{className:t.discountAmount,children:["-",N(a.total*M/100)]})]}),y>0&&e.jsxs("div",{className:t.paymentSummaryRow,children:[e.jsx("span",{children:"Bahşiş"}),e.jsx("span",{children:N(y)})]})]}),e.jsxs("div",{className:t.paymentTotal,children:[e.jsx("span",{children:"Toplam"}),e.jsx("strong",{children:N(H)})]})]}),e.jsxs("div",{className:t.extraPaymentFields,children:[e.jsxs("div",{className:t.extraField,children:[e.jsxs("label",{children:[e.jsx(Re,{size:14})," İndirim (%)"]}),e.jsx("input",{type:"number",min:"0",max:"100",value:M,onChange:s=>$(Math.min(100,Math.max(0,Number(s.target.value))))})]}),e.jsxs("div",{className:t.extraField,children:[e.jsxs("label",{children:[e.jsx(le,{size:14})," Bahşiş (₺)"]}),e.jsx("input",{type:"number",min:"0",value:y,onChange:s=>C(Math.max(0,Number(s.target.value)))})]})]}),e.jsxs("div",{className:t.splitToggle,children:[e.jsxs("button",{className:`${t.splitToggleBtn} ${h?t.active:""}`,onClick:()=>w(!h),children:[e.jsx(E,{size:16}),"Hesabı Böl"]}),h&&e.jsxs("div",{className:t.splitControl,children:[e.jsx("button",{onClick:()=>S(Math.max(2,u-1)),children:"−"}),e.jsxs("span",{children:[u," kişi"]}),e.jsx("button",{onClick:()=>S(Math.min(10,u+1)),children:"+"}),e.jsxs("span",{className:t.splitPerPerson,children:["Kişi başı: ",N(H/u)]})]})]}),e.jsxs("div",{className:t.paymentMethodSection,children:[e.jsx("p",{className:t.paymentMethodLabel,children:"Ödeme Yöntemi"}),e.jsx("div",{className:t.paymentMethodGrid,children:ws.map(({id:s,label:c,icon:_})=>e.jsxs("button",{className:`${t.paymentMethodBtn} ${d===s?t.selected:""}`,onClick:()=>m(s),children:[e.jsx(_,{size:24}),e.jsx("span",{children:c})]},s))})]}),e.jsxs("button",{className:t.confirmPaymentBtn,onClick:xe,disabled:X,children:[e.jsx(re,{size:20}),X?"İşleniyor...":`Ödemeyi Onayla — ${N(H)}`]})]})]})})]})}export{Ds as default};
