import{c as F,t as se,v as ne,z as A,w as J,o as ve,r as f,x as ge,j as e,X as ae,n as V,d as Ne,e as Me,y as Se,q as Ce,D as ke,E as Be,R as we,b as ie,k as re,F as Ie,C as $e,h as Pe,U as ze,A as Te,m as Z}from"./index-CRYHH34L.js";import{u as Ae}from"./useMenu-dQxjVsrV.js";import{u as Fe}from"./useTranslation-DmqdCpgm.js";import{C as Re}from"./circle-x-C4DfQ3ik.js";import{C as oe}from"./credit-card-Bz5CFwqH.js";import{P as Le}from"./printer-DbzlJV14.js";import{W as Oe}from"./wallet-B754Bmr6.js";import{R as He}from"./receipt-BHY62aXh.js";import{P as De}from"./percent-RCGnLxKa.js";import{D as le}from"./dollar-sign-B80GMlrZ.js";import{B as qe}from"./banknote-rGhL1Iiy.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ke=F("ArrowRightLeft",[["path",{d:"m16 3 4 4-4 4",key:"1x1c3m"}],["path",{d:"M20 7H4",key:"zbl0bi"}],["path",{d:"m8 21-4-4 4-4",key:"h9nckh"}],["path",{d:"M4 17h16",key:"g4d7ey"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=F("Calculator",[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=F("Merge",[["path",{d:"m8 6 4-4 4 4",key:"ybng9g"}],["path",{d:"M12 2v10.3a4 4 0 0 1-1.172 2.872L4 22",key:"1hyw0i"}],["path",{d:"m20 22-5-5",key:"1m27yz"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const z=F("Split",[["path",{d:"M16 3h5v5",key:"1806ms"}],["path",{d:"M8 3H3v5",key:"15dfkv"}],["path",{d:"M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3",key:"1qrqzj"}],["path",{d:"m15 9 6-6",key:"ko1vev"}]]),de={create:async i=>{const d=`RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,{data:n}=await J.post("/payments",{...i,receiptNumber:d,processedAt:new Date().toISOString()});return n},createSplit:async({orderId:i,tableId:d,splits:n})=>{const c=[];for(const l of n){const _=`RCP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,{data:v}=await J.post("/payments",{orderId:i,tableId:d,amount:l.amount,tip:l.tip||0,method:l.method,status:"completed",receiptNumber:_,processedAt:new Date().toISOString(),splitPayment:!0});c.push(v)}return c}},ce={all:["payments"]};function Qe(){const i=se();return ne({mutationFn:de.create,onSuccess:d=>{i.invalidateQueries({queryKey:ce.all}),i.invalidateQueries({queryKey:["orders"]}),i.setQueryData(["tables","list"],c=>c==null?void 0:c.map(l=>l.id===d.tableId?{...l,status:"available"}:l)),i.invalidateQueries({queryKey:["tables"]});const n={cash:"Nakit",credit_card:"Kredi Kartı",debit_card:"Banka Kartı",mobile:"Mobil Ödeme",online:"Online"};A.success(`Ödeme alındı: ₺${d.amount+(d.tip||0)} (${n[d.method]})`,{icon:"💳",duration:4e3})},onError:()=>{A.error("Ödeme işlemi başarısız!")}})}function Ge(){const i=se();return ne({mutationFn:de.createSplit,onSuccess:(d,{tableId:n})=>{i.invalidateQueries({queryKey:ce.all}),i.invalidateQueries({queryKey:["orders"]}),i.invalidateQueries({queryKey:["tables"]}),A.success(`${d.length} parça halinde ödeme alındı`,{icon:"💳"})},onError:()=>{A.error("Bölünmüş ödeme işlemi başarısız!")}})}const Ye=(i,d,n)=>{const c=window.open("","_blank");if(!c){alert("Lütfen tarayıcınızda pop-up engelleyiciyi kapatın");return}const l=`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fiş - Masa ${d.number}</title>
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
        <div class="restaurant-name">${n==null?void 0:n.name}</div>
        <div>${(n==null?void 0:n.address)||""}</div>
        <div>${(n==null?void 0:n.phone)||""}</div>
        <div class="date">${new Date().toLocaleString("tr-TR")}</div>
      </div>
      
      <div class="table-info">
        <div>
          <span>Masa:</span>
          <strong>Masa ${d.number}</span>
        </div>
        <div>
          <span>Garson:</span>
          <span>${i.waiterName||"Garson"}</span>
        </div>
        <div>
          <span>Sipariş No:</span>
          <span>${i.id}</span>
        </div>
      </div>
      
      <div class="items">
        ${i.items.map(_=>`
          <div class="item">
            <div class="item-header">
              <span>${_.quantity}x ${_.name}</span>
              <span>₺${(_.price*_.quantity).toFixed(2)}</span>
            </div>
            ${_.notes?`<div class="item-notes">Not: ${_.notes}</div>`:""}
          </div>
        `).join("")}
      </div>
      
      <div class="totals">
        <div class="total-row">
          <span>Ara Toplam:</span>
          <span>₺${(i.subtotal||i.totalAmount).toFixed(2)}</span>
        </div>
        ${i.discountAmount>0?`
          <div class="total-row" style="color: #22c55e;">
            <span>İndirim:</span>
            <span>-₺${i.discountAmount.toFixed(2)}</span>
          </div>
        `:""}
        <div class="total-row grand-total">
          <span>TOPLAM:</span>
          <span>₺${i.totalAmount.toFixed(2)}</span>
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
  `;c.document.write(l),c.document.close()};function We(){const i=ve(n=>n.soundEnabled);return{play:f.useCallback(n=>{if(!i)return;const c=ge[n];c&&c()},[i])}}const Ue="_overlay_1dy4n_3",Xe="_modal_1dy4n_16",Je="_header_1dy4n_44",Ve="_closeBtn_1dy4n_58",Ze="_currentInfo_1dy4n_75",et="_infoCard_1dy4n_81",tt="_tabs_1dy4n_96",st="_tab_1dy4n_96",nt="_active_1dy4n_123",at="_content_1dy4n_129",it="_description_1dy4n_135",rt="_tableGrid_1dy4n_142",ot="_tableBtn_1dy4n_149",lt="_selected_1dy4n_165",dt="_actionBtn_1dy4n_176",ct="_splitModes_1dy4n_203",mt="_modeBtn_1dy4n_210",pt="_splitControl_1dy4n_235",ut="_counterControl_1dy4n_247",xt="_splitPreview_1dy4n_280",yt="_previewLabel_1dy4n_291",ht="_previewAmount_1dy4n_297",_t="_customSplit_1dy4n_303",ft="_splitInput_1dy4n_310",jt="_splitSummary_1dy4n_337",a={overlay:Ue,modal:Xe,header:Je,closeBtn:Ve,currentInfo:Ze,infoCard:et,tabs:tt,tab:st,active:nt,content:at,description:it,tableGrid:rt,tableBtn:ot,selected:lt,actionBtn:dt,splitModes:ct,modeBtn:mt,splitControl:pt,counterControl:ut,splitPreview:xt,previewLabel:yt,previewAmount:ht,customSplit:_t,splitInput:ft,splitSummary:jt},$=i=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:0}).format(i);function bt({isOpen:i,onClose:d,currentTable:n,availableTables:c,order:l,onTransfer:_,onMerge:v,onSplit:w}){const[h,k]=f.useState("transfer"),[j,B]=f.useState(null),[x,S]=f.useState(2),[p,N]=f.useState([]);if(!i||!n||!l)return null;const g=()=>{if(!j){alert("Lütfen hedef masa seçin");return}_(n.id,j),d()},R=()=>{if(!j){alert("Lütfen birleştirilecek masayı seçin");return}v(n.id,j),d()},L=()=>{const r=l.total/x;w(l.id,Array(x).fill(r)),d()},O=()=>{const r=p.reduce((y,C)=>y+(parseFloat(C)||0),0);if(Math.abs(r-l.total)>.01){alert(`Toplam ${$(l.total)} olmalı. Şu an: ${$(r)}`);return}w(l.id,p.map(y=>parseFloat(y))),d()};return e.jsxs(e.Fragment,{children:[e.jsx("div",{className:a.overlay,onClick:d}),e.jsxs("div",{className:a.modal,children:[e.jsxs("div",{className:a.header,children:[e.jsx("h2",{children:"Masa İşlemleri"}),e.jsx("button",{className:a.closeBtn,onClick:d,children:e.jsx(ae,{size:20})})]}),e.jsx("div",{className:a.currentInfo,children:e.jsxs("div",{className:a.infoCard,children:[e.jsxs("span",{children:["Masa ",n.number]}),e.jsx("strong",{children:$(l.total)})]})}),e.jsxs("div",{className:a.tabs,children:[e.jsxs("button",{className:`${a.tab} ${h==="transfer"?a.active:""}`,onClick:()=>k("transfer"),children:[e.jsx(V,{size:18}),"Transfer"]}),e.jsxs("button",{className:`${a.tab} ${h==="merge"?a.active:""}`,onClick:()=>k("merge"),children:[e.jsx(ee,{size:18}),"Birleştir"]}),e.jsxs("button",{className:`${a.tab} ${h==="split"?a.active:""}`,onClick:()=>k("split"),children:[e.jsx(z,{size:18}),"Hesap Böl"]})]}),e.jsxs("div",{className:a.content,children:[h==="transfer"&&e.jsxs("div",{className:a.transferSection,children:[e.jsxs("p",{className:a.description,children:["Masa ",n.number,"'deki siparişi başka bir masaya taşıyın"]}),e.jsx("div",{className:a.tableGrid,children:c==null?void 0:c.map(r=>e.jsxs("button",{className:`${a.tableBtn} ${j===r.id?a.selected:""}`,onClick:()=>B(r.id),disabled:r.id===n.id,children:["Masa ",r.number]},r.id))}),e.jsxs("button",{className:a.actionBtn,onClick:g,disabled:!j,children:[e.jsx(V,{size:18}),"Transfer Et"]})]}),h==="merge"&&e.jsxs("div",{className:a.mergeSection,children:[e.jsxs("p",{className:a.description,children:["Masa ",n.number,"'ü başka bir masa ile birleştirin"]}),e.jsx("div",{className:a.tableGrid,children:c==null?void 0:c.filter(r=>r.status==="occupied").map(r=>e.jsxs("button",{className:`${a.tableBtn} ${j===r.id?a.selected:""}`,onClick:()=>B(r.id),disabled:r.id===n.id,children:["Masa ",r.number]},r.id))}),e.jsxs("button",{className:a.actionBtn,onClick:R,disabled:!j,children:[e.jsx(ee,{size:18}),"Masaları Birleştir"]})]}),h==="split"&&e.jsxs("div",{className:a.splitSection,children:[e.jsxs("div",{className:a.splitModes,children:[e.jsxs("button",{className:`${a.modeBtn} ${p.length?"":a.active}`,onClick:()=>N([]),children:[e.jsx(Ee,{size:18}),"Eşit Böl"]}),e.jsxs("button",{className:`${a.modeBtn} ${p.length?a.active:""}`,onClick:()=>{const r=Array(x).fill("");N(r)},children:[e.jsx(z,{size:18}),"Özel Böl"]})]}),p.length?e.jsxs(e.Fragment,{children:[e.jsx("div",{className:a.customSplit,children:p.map((r,y)=>e.jsxs("div",{className:a.splitInput,children:[e.jsxs("label",{children:["Kişi ",y+1]}),e.jsx("input",{type:"number",value:r,onChange:C=>{const T=[...p];T[y]=C.target.value,N(T)},placeholder:"0.00"})]},y))}),e.jsxs("div",{className:a.splitSummary,children:[e.jsxs("div",{children:["Toplam: ",$(p.reduce((r,y)=>r+(parseFloat(y)||0),0))]}),e.jsxs("div",{children:["Hedef: ",$(l.total)]})]}),e.jsxs("button",{className:a.actionBtn,onClick:O,children:[e.jsx(z,{size:18}),"Hesabı Böl"]})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:a.splitControl,children:[e.jsx("label",{children:"Kaç kişiye bölünsün?"}),e.jsxs("div",{className:a.counterControl,children:[e.jsx("button",{onClick:()=>S(Math.max(2,x-1)),children:"-"}),e.jsx("span",{children:x}),e.jsx("button",{onClick:()=>S(Math.min(10,x+1)),children:"+"})]})]}),e.jsxs("div",{className:a.splitPreview,children:[e.jsx("div",{className:a.previewLabel,children:"Kişi başı:"}),e.jsx("div",{className:a.previewAmount,children:$(l.total/x)})]}),e.jsxs("button",{className:a.actionBtn,onClick:L,children:[e.jsx(z,{size:18}),"Eşit Böl (",x," Kişi)"]})]})]})]})]})]})}const vt="_orders_1xtfs_3",gt="_ordersHeader_1xtfs_10",Nt="_refreshBtn_1xtfs_28",Mt="_spinning_1xtfs_48",St="_spin_1xtfs_48",Ct="_printBtn_1xtfs_52",kt="_filters_1xtfs_77",Bt="_filterBtn_1xtfs_83",wt="_active_1xtfs_100",It="_ordersList_1xtfs_107",$t="_orderCard_1xtfs_114",Pt="_orderHeader_1xtfs_127",zt="_orderInfo_1xtfs_136",Tt="_orderNumber_1xtfs_140",At="_orderMeta_1xtfs_147",Ft="_orderTable_1xtfs_155",Rt="_orderTime_1xtfs_159",Lt="_orderWaiter_1xtfs_160",Ot="_orderSep_1xtfs_166",Ht="_orderStatus_1xtfs_170",Dt="_warning_1xtfs_180",qt="_info_1xtfs_185",Kt="_success_1xtfs_190",Et="_danger_1xtfs_195",Qt="_orderItems_1xtfs_201",Gt="_orderItem_1xtfs_201",Yt="_itemQuantity_1xtfs_218",Wt="_itemName_1xtfs_224",Ut="_itemPrice_1xtfs_229",Xt="_orderFooter_1xtfs_235",Jt="_orderTotal_1xtfs_244",Vt="_orderActions_1xtfs_260",Zt="_actionBtn_1xtfs_265",es="_primary_1xtfs_275",ts="_emptyState_1xtfs_304",ss="_payment_1xtfs_327",ns="_paymentBadge_1xtfs_340",as="_modalOverlay_1xtfs_350",is="_paymentModal_1xtfs_357",rs="_paymentModalHeader_1xtfs_375",os="_paymentModalTitle_1xtfs_381",ls="_modalCloseBtn_1xtfs_399",ds="_paymentItems_1xtfs_415",cs="_paymentItem_1xtfs_415",ms="_paymentItemQty_1xtfs_432",ps="_paymentItemName_1xtfs_438",us="_paymentItemPrice_1xtfs_443",xs="_paymentTotal_1xtfs_448",ys="_paymentMethodSection_1xtfs_464",hs="_paymentMethodLabel_1xtfs_470",_s="_paymentMethodGrid_1xtfs_477",fs="_paymentMethodBtn_1xtfs_483",js="_selected_1xtfs_505",bs="_confirmPaymentBtn_1xtfs_512",vs="_paymentSummaryRows_1xtfs_539",gs="_paymentSummaryRow_1xtfs_539",Ns="_discountAmount_1xtfs_555",Ms="_extraPaymentFields_1xtfs_557",Ss="_extraField_1xtfs_563",Cs="_splitToggle_1xtfs_587",ks="_splitToggleBtn_1xtfs_593",Bs="_splitControl_1xtfs_614",ws="_splitPerPerson_1xtfs_632",s={orders:vt,ordersHeader:gt,refreshBtn:Nt,spinning:Mt,spin:St,printBtn:Ct,filters:kt,filterBtn:Bt,active:wt,ordersList:It,orderCard:$t,orderHeader:Pt,orderInfo:zt,orderNumber:Tt,orderMeta:At,orderTable:Ft,orderTime:Rt,orderWaiter:Lt,orderSep:Ot,orderStatus:Ht,warning:Dt,info:qt,success:Kt,danger:Et,orderItems:Qt,orderItem:Gt,itemQuantity:Yt,itemName:Wt,itemPrice:Ut,orderFooter:Xt,orderTotal:Jt,orderActions:Vt,actionBtn:Zt,primary:es,emptyState:ts,payment:ss,paymentBadge:ns,modalOverlay:as,paymentModal:is,paymentModalHeader:rs,paymentModalTitle:os,modalCloseBtn:ls,paymentItems:ds,paymentItem:cs,paymentItemQty:ms,paymentItemName:ps,paymentItemPrice:us,paymentTotal:xs,paymentMethodSection:ys,paymentMethodLabel:hs,paymentMethodGrid:_s,paymentMethodBtn:fs,selected:js,confirmPaymentBtn:bs,paymentSummaryRows:vs,paymentSummaryRow:gs,discountAmount:Ns,extraPaymentFields:Ms,extraField:Ss,splitToggle:Cs,splitToggleBtn:ks,splitControl:Bs,splitPerPerson:ws},te={pending:{label:"Bekliyor",icon:ie,color:"warning"},preparing:{label:"Hazırlanıyor",icon:$e,color:"info"},ready:{label:"Hazır",icon:Ie,color:"success"},served:{label:"Servis Edildi",icon:re,color:"success"},completed:{label:"Tamamlandı",icon:oe,color:"success"},cancelled:{label:"İptal",icon:Re,color:"danger"}},K=[{id:"cash",label:"Nakit",icon:qe,apiMethod:"cash"},{id:"card",label:"Kart",icon:oe,apiMethod:"credit_card"},{id:"online",label:"Online",icon:le,apiMethod:"mobile"}],M=i=>new Intl.NumberFormat("tr-TR",{style:"currency",currency:"TRY",minimumFractionDigits:0}).format(i),Is=i=>new Date(i).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"});function qs(){const[i,d]=f.useState("all"),[n,c]=f.useState(null),[l,_]=f.useState("cash"),[v,w]=f.useState(0),[h,k]=f.useState(0),[j,B]=f.useState(!1),[x,S]=f.useState(2),[p,N]=f.useState(null),{data:g,isLoading:R,refetch:L,isRefetching:O}=Ne(),{data:r}=Me(),{data:y}=Ae(),C=Se(),T=Ce(),E=Qe(),Q=Ge(),me=ke(),pe=Be(),{play:ue}=We(),{t:P}=Fe(),H=(g==null?void 0:g.filter(t=>i==="all"?!0:i==="active"?["pending","preparing","ready","served"].includes(t.status):t.status===i).sort((t,o)=>new Date(o.createdAt)-new Date(t.createdAt)))||[],I=f.useMemo(()=>{if(!n)return 0;const t=n.total*(v/100);return Math.max(0,n.total-t+h)},[n,v,h]),D=()=>{c(null),_("cash"),w(0),k(0),B(!1),S(2)},G=t=>{c(t),_("cash"),w(0),k(0),B(!1),S(2)},q=(t,o)=>{C.mutate({id:t,status:o})},xe=t=>{window.confirm("Siparişi iptal etmek istediğinize emin misiniz?")&&C.mutate({id:t,status:"cancelled"})},Y=t=>{var o;(o=K.find(m=>m.id===l))!=null&&o.apiMethod,C.mutate({id:n.id,status:"completed",paymentMethod:l,discount:v,tip:h,finalTotal:I,receiptNumber:t},{onSuccess:()=>{T.mutate({id:n.tableId,status:"available"}),ue("payment"),D()}})},ye=()=>{var o;if(!n)return;const t=((o=K.find(m=>m.id===l))==null?void 0:o.apiMethod)||"cash";if(j&&x>1){const m=I/x;Q.mutate({orderId:n.id,tableId:n.tableId,splits:Array.from({length:x},()=>({amount:m,method:t}))},{onSuccess:u=>{var b;Y((b=u[0])==null?void 0:b.receiptNumber)}});return}E.mutate({orderId:n.id,tableId:n.tableId,amount:I-h,tip:h,method:t,status:"completed",discount:v},{onSuccess:m=>{Y(m.receiptNumber)}})},W=t=>{const o=r==null?void 0:r.find(m=>m.id==t);return o?o.number:t},U=t=>{const o=y==null?void 0:y.find(m=>m.id==t);return o?o.name:"Bilinmeyen Ürün"},he=t=>{const o=(r==null?void 0:r.find(u=>u.id==t.tableId))||{number:t.tableId},m={...t,items:t.items.map(u=>{const b=y==null?void 0:y.find(be=>be.id==u.menuItemId);return{...u,name:(b==null?void 0:b.name)||"Ürün",price:u.price||(b==null?void 0:b.price)||0}})};Ye(m,o,{name:"Lezzet Durağı"})},_e=(t,o)=>{if(!(p!=null&&p.order)||!g)return;const m=g.find(u=>u.tableId==o&&["pending","preparing","ready","served"].includes(u.status));if(!m){toast.error("Hedef masada aktif sipariş bulunamadı");return}pe.mutate({sourceOrderId:p.order.id,targetOrderId:m.id,targetTableId:o,sourceTableId:t}),N(null)},fe=(t,o)=>{p!=null&&p.order&&(me.mutate({orderId:p.order.id,fromTableId:t,toTableId:o}),N(null))},je=(t,o)=>{const m=g==null?void 0:g.find(u=>u.id===t);m&&(G(m),B(!0),S(o.length),N(null))},X=E.isPending||Q.isPending||C.isPending;return R?e.jsx("div",{className:s.orders,children:"Yükleniyor..."}):e.jsxs("div",{className:s.orders,children:[e.jsxs("div",{className:s.ordersHeader,children:[e.jsxs("div",{children:[e.jsx("h1",{children:P("orders.title")}),e.jsxs("p",{children:[H.length," sipariş"]})]}),e.jsx("button",{className:`${s.refreshBtn} ${O?s.spinning:""}`,onClick:()=>L(),children:e.jsx(we,{size:18})})]}),e.jsx("div",{className:s.filters,children:[{key:"all",label:"Tümü"},{key:"active",label:"Aktif"},{key:"pending",label:P("orders.statuses.pending")},{key:"preparing",label:P("orders.statuses.preparing")},{key:"ready",label:P("orders.statuses.ready")},{key:"completed",label:P("orders.statuses.completed")}].map(({key:t,label:o})=>e.jsx("button",{className:`${s.filterBtn} ${i===t?s.active:""}`,onClick:()=>d(t),children:o},t))}),e.jsx("div",{className:s.ordersList,children:H.length===0?e.jsxs("div",{className:s.emptyState,children:[e.jsx(ie,{size:48}),e.jsx("h3",{children:"Sipariş bulunamadı"}),e.jsx("p",{children:"Seçili filtreye uygun sipariş yok"})]}):H.map(t=>{const o=te[t.status]||te.pending,m=o.icon;return e.jsxs("div",{className:s.orderCard,children:[e.jsxs("div",{className:s.orderHeader,children:[e.jsxs("div",{className:s.orderInfo,children:[e.jsxs("div",{className:s.orderNumber,children:["Sipariş #",t.id]}),e.jsxs("div",{className:s.orderMeta,children:[e.jsxs("span",{className:s.orderTable,children:["Masa ",W(t.tableId)]}),e.jsx("span",{className:s.orderSep,children:"•"}),e.jsxs("span",{className:s.orderTime,children:[e.jsx(Pe,{size:14}),Is(t.createdAt)]}),t.waiter&&e.jsxs(e.Fragment,{children:[e.jsx("span",{className:s.orderSep,children:"•"}),e.jsxs("span",{className:s.orderWaiter,children:[e.jsx(ze,{size:14}),t.waiter]})]})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px"},children:[["served","ready","preparing"].includes(t.status)&&e.jsx("button",{className:s.printBtn,onClick:()=>{const u=r==null?void 0:r.find(b=>b.id==t.tableId);N({table:u,order:t})},title:"Masa İşlemleri",children:e.jsx(Ke,{size:16})}),e.jsx("button",{className:s.printBtn,onClick:()=>he(t),title:"Fiş Yazdır",children:e.jsx(Le,{size:16})}),e.jsxs("div",{className:`${s.orderStatus} ${s[o.color]}`,children:[e.jsx(m,{size:16}),e.jsx("span",{children:o.label})]})]})]}),e.jsx("div",{className:s.orderItems,children:t.items.map((u,b)=>e.jsxs("div",{className:s.orderItem,children:[e.jsxs("span",{className:s.itemQuantity,children:[u.quantity,"x"]}),e.jsx("span",{className:s.itemName,children:U(u.menuItemId)}),e.jsx("span",{className:s.itemPrice,children:M(u.price*u.quantity)})]},b))}),e.jsxs("div",{className:s.orderFooter,children:[e.jsxs("div",{className:s.orderTotal,children:[e.jsx("span",{children:"Toplam:"}),e.jsx("strong",{children:M(t.total)})]}),e.jsxs("div",{className:s.orderActions,children:[t.status==="pending"&&e.jsxs(e.Fragment,{children:[e.jsx("button",{className:`${s.actionBtn} ${s.primary}`,onClick:()=>q(t.id,"preparing"),children:"Hazırlamaya Başla"}),e.jsx("button",{className:`${s.actionBtn} ${s.danger}`,onClick:()=>xe(t.id),children:"İptal"})]}),t.status==="preparing"&&e.jsx("button",{className:`${s.actionBtn} ${s.success}`,onClick:()=>q(t.id,"ready"),children:"Hazır"}),t.status==="ready"&&e.jsx("button",{className:`${s.actionBtn} ${s.success}`,onClick:()=>q(t.id,"served"),children:"Servis Et"}),t.status==="served"&&e.jsxs("button",{className:`${s.actionBtn} ${s.payment}`,onClick:()=>G(t),children:[e.jsx(Oe,{size:16})," Ödeme Al"]}),t.status==="completed"&&t.paymentMethod&&e.jsx("span",{className:s.paymentBadge,children:t.paymentMethod==="cash"?"💵 Nakit":t.paymentMethod==="card"?"💳 Kart":"📱 Online"})]})]})]},t.id)})}),p&&e.jsx(bt,{isOpen:!!p,onClose:()=>N(null),currentTable:p.table,availableTables:r,order:p.order,onTransfer:fe,onMerge:_e,onSplit:je}),e.jsx(Te,{children:n&&e.jsxs(e.Fragment,{children:[e.jsx(Z.div,{className:s.modalOverlay,initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:D}),e.jsxs(Z.div,{className:s.paymentModal,initial:{opacity:0,scale:.95,y:20},animate:{opacity:1,scale:1,y:0},exit:{opacity:0,scale:.95,y:20},children:[e.jsxs("div",{className:s.paymentModalHeader,children:[e.jsxs("div",{className:s.paymentModalTitle,children:[e.jsx(He,{size:22}),e.jsxs("div",{children:[e.jsx("h2",{children:"Ödeme Al"}),e.jsxs("p",{children:["Sipariş #",n.id," • Masa ",W(n.tableId)]})]})]}),e.jsx("button",{className:s.modalCloseBtn,onClick:D,children:e.jsx(ae,{size:20})})]}),e.jsxs("div",{className:s.paymentItems,children:[n.items.map((t,o)=>e.jsxs("div",{className:s.paymentItem,children:[e.jsxs("span",{className:s.paymentItemQty,children:[t.quantity,"x"]}),e.jsx("span",{className:s.paymentItemName,children:U(t.menuItemId)}),e.jsx("span",{className:s.paymentItemPrice,children:M(t.price*t.quantity)})]},o)),e.jsxs("div",{className:s.paymentSummaryRows,children:[e.jsxs("div",{className:s.paymentSummaryRow,children:[e.jsx("span",{children:"Ara Toplam"}),e.jsx("span",{children:M(n.total)})]}),v>0&&e.jsxs("div",{className:s.paymentSummaryRow,children:[e.jsxs("span",{children:["İndirim (%",v,")"]}),e.jsxs("span",{className:s.discountAmount,children:["-",M(n.total*v/100)]})]}),h>0&&e.jsxs("div",{className:s.paymentSummaryRow,children:[e.jsx("span",{children:"Bahşiş"}),e.jsx("span",{children:M(h)})]})]}),e.jsxs("div",{className:s.paymentTotal,children:[e.jsx("span",{children:"Toplam"}),e.jsx("strong",{children:M(I)})]})]}),e.jsxs("div",{className:s.extraPaymentFields,children:[e.jsxs("div",{className:s.extraField,children:[e.jsxs("label",{children:[e.jsx(De,{size:14})," İndirim (%)"]}),e.jsx("input",{type:"number",min:"0",max:"100",value:v,onChange:t=>w(Math.min(100,Math.max(0,Number(t.target.value))))})]}),e.jsxs("div",{className:s.extraField,children:[e.jsxs("label",{children:[e.jsx(le,{size:14})," Bahşiş (₺)"]}),e.jsx("input",{type:"number",min:"0",value:h,onChange:t=>k(Math.max(0,Number(t.target.value)))})]})]}),e.jsxs("div",{className:s.splitToggle,children:[e.jsxs("button",{className:`${s.splitToggleBtn} ${j?s.active:""}`,onClick:()=>B(!j),children:[e.jsx(z,{size:16}),"Hesabı Böl"]}),j&&e.jsxs("div",{className:s.splitControl,children:[e.jsx("button",{onClick:()=>S(Math.max(2,x-1)),children:"−"}),e.jsxs("span",{children:[x," kişi"]}),e.jsx("button",{onClick:()=>S(Math.min(10,x+1)),children:"+"}),e.jsxs("span",{className:s.splitPerPerson,children:["Kişi başı: ",M(I/x)]})]})]}),e.jsxs("div",{className:s.paymentMethodSection,children:[e.jsx("p",{className:s.paymentMethodLabel,children:"Ödeme Yöntemi"}),e.jsx("div",{className:s.paymentMethodGrid,children:K.map(({id:t,label:o,icon:m})=>e.jsxs("button",{className:`${s.paymentMethodBtn} ${l===t?s.selected:""}`,onClick:()=>_(t),children:[e.jsx(m,{size:24}),e.jsx("span",{children:o})]},t))})]}),e.jsxs("button",{className:s.confirmPaymentBtn,onClick:ye,disabled:X,children:[e.jsx(re,{size:20}),X?"İşleniyor...":`Ödemeyi Onayla — ${M(I)}`]})]})]})})]})}export{qs as default};
