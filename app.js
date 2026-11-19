(() => {
  'use strict';
  const config=window.PUNTO_CONFIG, {products,money,calculate,message}=window.PuntoOrder;
  const $=selector=>document.querySelector(selector), $$=selector=>[...document.querySelectorAll(selector)];
  const cart={}, form=$('#order-form');
  let promo='units', delivery='pickup', sending=false, lastSubmission=null, selectedCategory=null;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interactionAnimations = new WeakMap();

  function animateInteraction(element, frames, duration) {
    if (reducedMotion.matches || !element?.animate) return;
    interactionAnimations.get(element)?.cancel();
    interactionAnimations.set(element, element.animate(frames, {
      duration,
      easing: 'cubic-bezier(.2,.75,.25,1)'
    }));
  }

  function animateReveal(element) {
    animateInteraction(element, [
      { opacity: .72, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], 220);
  }

  function emphasizeCount(element) {
    animateInteraction(element, [
      { scale: 1 },
      { scale: 1.15, offset: .4 },
      { scale: 1 }
    ], 210);
  }
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storage={get(key){try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{/* Navigation and ordering work without storage. */}}};
  const variantsFor = p=>p.cheese ? [false,true].map(withCheese=>({...p,withCheese,cartKey:`${p.id}-${withCheese?'con':'sin'}-queso`})) : [{...p,cartKey:p.id}];
  function stepper(p,quantity,where){const key=p.cartKey||p.id,label=escape(p.name)+(p.cheese?(p.withCheese?' con queso':' sin queso'):'');return `<div class="stepper"><button type="button" data-product="${key}" data-change="-1" aria-label="Quitar una ${label}${where}" ${quantity?'':'disabled'}>−</button><output aria-label="Cantidad de ${label}">${quantity}</output><button type="button" class="plus" data-product="${key}" data-change="1" aria-label="Agregar una ${label}${where}" ${quantity>=120?'disabled':''}>+</button></div>`;}
  const menuOrder = [...products].sort((a,b)=>a.name.localeCompare(b.name,'es-AR',{numeric:true}));
  let empanadaNumber = 0;
  menuOrder.forEach(p=>{
    const variants=variantsFor(p);
    variants.forEach(variant=>{cart[variant.cartKey]={quantity:0};});
    const article=document.createElement('article');article.className=`product ${p.category}`;article.id=`product-${p.id}`;
    const mark = p.category==='pizza' ? 'P' : String(++empanadaNumber).padStart(2,'0');
    article.innerHTML=`<div class="product-title"><span class="product-mark" aria-hidden="true">${mark}</span><h3>${p.name}</h3></div><p class="${p.ingredients?'ingredient-copy':''}">${escape(p.ingredients||p.description||'Pizza entera · para compartir')}</p>${p.cheese?`<div class="cheese-variants" role="group" aria-label="Elegí las cantidades de ${p.name}">${variants.map(variant=>`<div class="cheese-variant"><span>${variant.withCheese?'Con queso':'Sin queso'}</span>${stepper(variant,0,'')}</div>`).join('')}</div>`:`<div class="product-bottom"><span>${money(p.price||config.unitPrice)}</span>${stepper(p,0,'')}</div>`}`;
    $(p.category==='empanada'?'#empanada-list':'#pizza-list').append(article);
  });
  function order(){return calculate(cart,promo,delivery,config);}
  function render(){
    const current=order();
    products.forEach(p=>{const item=$(`#product-${p.id}`),variants=variantsFor(p);item.classList.toggle('selected',variants.some(variant=>cart[variant.cartKey].quantity>0));variants.forEach(variant=>{const quantity=cart[variant.cartKey].quantity,minus=item.querySelector(`[data-product="${variant.cartKey}"][data-change="-1"]`),plus=item.querySelector(`[data-product="${variant.cartKey}"][data-change="1"]`);minus.closest('.stepper').querySelector('output').value=quantity;minus.disabled=!quantity;plus.disabled=quantity>=120;});});
    $$('[name="promo"]').forEach(input=>{input.checked=input.value===promo;});
    $('#promo-progress').textContent=current.empanadas<12?`${current.empanadas} de 12 empanadas · ${current.empanadas===11?'falta 1':'faltan '+(12-current.empanadas)} para completar una docena`:`${current.empanadas} empanadas · ${current.dozens} ${current.dozens===1?'docena aplicada':'docenas aplicadas'}${current.mode==='combo'?' con Pritty':' a $25.000'}`;
    $('#progress-fill').style.width=`${Math.min(100,current.empanadas/12*100)}%`;
    $('#nav-count').textContent=current.quantity;$('#cart-count').textContent=`${current.quantity} ${current.quantity===1?'producto':'productos'}`;
    $('#cart-items').innerHTML=current.items.length?current.items.map(p=>`<div class="cart-row"><div><strong>${escape(p.name)}${p.category==='pizza'?' · pizza':''}</strong><small>${p.cheese?(p.withCheese?'Con queso':'Sin queso'):p.category==='empanada'?'Empanada':money(p.price)+' cada una'}</small></div>${stepper(p,p.quantity,' en tu pedido')}</div>`).join(''):'<div class="empty-cart"><div class="empty-icon" aria-hidden="true">＋</div><h3>Acá empieza un buen plan.</h3><p>Sumá tus favoritos del menú<br>y armá algo rico.</p></div>';
    $('#cart-totals').hidden=!current.items.length;
    $('#clear-cart').disabled=!current.items.length||sending;
    const line=(label,value,extra='')=>`<div class="total-line ${extra}"><span>${label}</span><span>${value}</span></div>`;
    $('#cart-totals').innerHTML=`<div class="totals">${current.dozens?line(`${current.dozens} × ${current.mode==='combo'?'docena + Pritty 2,25 L':'docena'}`,money(current.dozens*(current.mode==='combo'?config.comboPrice:config.dozenPrice))):''}${current.extras?line(`${current.extras} empanadas ${current.dozens?'extra':'por unidad'}`,money(current.extras*config.unitPrice)):''}${current.pizzas?line('Pizzas',money(current.pizzas)):''}${current.mode==='dozen'&&current.dozens?line('Ahorrás con la docena',money(current.dozens*(12*config.unitPrice-config.dozenPrice)),'discount'):''}${line('Envío',current.shipping?money(current.shipping):'Sin costo') }<div class="total-line grand-total"><span>Total <small>ARS</small></span><strong>${money(current.total)}</strong></div></div>`;
    $('#submit-order').disabled=!current.items.length||current.promoIncomplete||sending;
    $('#promo-checkout-note').hidden=!current.promoIncomplete;
    $('#promo-checkout-note').textContent=current.promoIncomplete?`Elegiste ${promo==='combo'?'docena + Pritty':'la docena'}. Sumá ${12-current.empanadas} ${current.empanadas===11?'empanada más':'empanadas más'} para poder pedir. El precio de la promo se aplica al completar las 12.`:'';
    $('#address-field').hidden=delivery!=='delivery';form.elements.address.required=delivery==='delivery';form.elements.address.disabled=delivery!=='delivery';
    $('#pedido').hidden=!selectedCategory&&!current.items.length;
    $('#mobile-cart').hidden=!current.items.length;$('#mobile-count').textContent=current.quantity;$('#mobile-total').textContent=money(current.total);
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-change]');
    if (!button) return;
    const id = button.dataset.product;
    const change = button.dataset.change;
    const inCart = Boolean(button.closest('#cart-items'));
    cart[id].quantity = Math.min(120, Math.max(0, cart[id].quantity + Number(change)));
    $('#send-status').textContent = '';
    render();
    const updatedButton = inCart
      ? $(`#cart-items [data-product="${id}"][data-change="${change}"]`)
      : button;
    emphasizeCount(updatedButton?.closest('.stepper')?.querySelector('output'));
    emphasizeCount($('#nav-count'));
    emphasizeCount($('#mobile-count'));
    if (inCart && updatedButton && !updatedButton.disabled) updatedButton.focus({preventScroll:true});
  });
  $('#clear-cart').addEventListener('click', () => {
    Object.values(cart).forEach(item => { item.quantity = 0; });
    lastSubmission = null;
    $('#form-error').hidden = true;
    $('#form-error').textContent = '';
    $('#send-status').textContent = 'Se quitaron todos los productos del pedido.';
    render();
    animateReveal($('#cart-items .empty-cart'));
  });
  document.addEventListener('change',event=>{const input=event.target;if(input.name==='promo'){promo=input.value;render();}if(input.name==='delivery'){delivery=input.value;render();}});
  const categoryNames={empanadas:'Empanadas',pizzas:'Pizzas',bebidas:'Bebidas',promociones:'Promociones'};
  function openCategory(category){
    if(!categoryNames[category])return;
    selectedCategory=category;
    $('#category-home').hidden=true;$('#category-view').hidden=false;
    $('#category-title').textContent=categoryNames[category];
    $$('.category-panel').forEach(panel=>{panel.hidden=panel.id!==`panel-${category}`;});
    render();
    $('#category-title').focus({preventScroll:true});
    $('#menu').scrollIntoView({block:'start'});
    animateReveal($('#category-view'));
  }
  $$('[data-category]').forEach(button=>button.addEventListener('click',()=>openCategory(button.dataset.category)));
  $('#category-back').addEventListener('click',()=>{
    selectedCategory=null;$('#category-view').hidden=true;$('#category-home').hidden=false;
    render();$('#menu-title').setAttribute('tabindex','-1');$('#menu-title').focus({preventScroll:true});$('#menu').scrollIntoView({block:'start'});
    animateReveal($('#category-home'));
  });
  $('#promo-to-empanadas').addEventListener('click',()=>openCategory('empanadas'));
  $('.nav-order').addEventListener('click',()=>{if($('#pedido').hidden)openCategory('empanadas');});
  // No nombres, direcciones, notas, URLs de WhatsApp ni medios de pago en Analytics.
  let analyticsReady=false,consent=storage.get('punto-analytics-consent');
  const validMeasurementId=/^G-[A-Z0-9]+$/.test(config.gaMeasurementId);
  function enableAnalytics(){
    if(!validMeasurementId||analyticsReady)return;
    window[`ga-disable-${config.gaMeasurementId}`]=false;
    window.dataLayer=window.dataLayer||[];
    window.gtag=function(){window.dataLayer.push(arguments);};
    window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
    window.gtag('js',new Date());window.gtag('config',config.gaMeasurementId,{allow_google_signals:false,allow_ad_personalization_signals:false});
    const script=document.createElement('script');script.async=true;script.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.gaMeasurementId)}`;document.head.append(script);analyticsReady=true;
  }
  if(validMeasurementId){if(consent==='yes')enableAnalytics();else if(consent!=='no')$('#cookie-banner').hidden=false;}
  $('#accept-analytics').addEventListener('click',()=>{consent='yes';storage.set('punto-analytics-consent','yes');enableAnalytics();$('#cookie-banner').hidden=true;});
  $('#reject-analytics').addEventListener('click',()=>{consent='no';storage.set('punto-analytics-consent','no');$('#cookie-banner').hidden=true;});
  $('#privacy-open').addEventListener('click',()=>$('#privacy-dialog').showModal());$('#privacy-close').addEventListener('click',()=>$('#privacy-dialog').close());
  $('#revoke-analytics').addEventListener('click',()=>{consent='no';storage.set('punto-analytics-consent','no');window[`ga-disable-${config.gaMeasurementId}`]=true;if(window.gtag)window.gtag('consent','update',{analytics_storage:'denied'});document.cookie.split(';').forEach(cookie=>{const name=cookie.split('=')[0].trim();if(/^_ga($|_)/.test(name)){const hosts=location.hostname.split('.');document.cookie=`${name}=; Max-Age=0; path=/`;for(let i=0;i<hosts.length-1;i++)document.cookie=`${name}=; Max-Age=0; path=/; domain=.${hosts.slice(i).join('.')}`;}});$('#cookie-banner').hidden=true;$('#privacy-status').textContent='Estadísticas desactivadas en este navegador.';});
  form.addEventListener('submit',event=>{
    event.preventDefault();if(sending)return;
    const current=order(),customer={name:form.elements.customer.value.trim(),address:form.elements.address.value.trim(),payment:form.elements.payment.value,notes:form.elements.notes.value.trim(),delivery};
    const error=current.promoIncomplete?`Completá las 12 empanadas de tu promo: faltan ${12-current.empanadas}.`:!current.items.length?'Sumá algún producto para armar tu pedido.':!customer.name?'Completá tu nombre.':delivery==='delivery'&&!customer.address?'Completá tu dirección para el envío.':!customer.payment?'Elegí cómo vas a abonar.':'';
    $('#form-error').hidden=!error;$('#form-error').textContent=error;if(error)return;
    const signature=JSON.stringify({items:current.items.map(p=>[p.id,p.quantity,p.withCheese]),promo,delivery,customer,total:current.total});
    const duplicate=lastSubmission?.signature===signature;
    const id=duplicate?lastSubmission.id:`PE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
    const url=`https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message(current,customer,config))}`;
    // Abrir durante el gesto del usuario evita bloqueos por callbacks de Analytics.
    const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;
    sending=true;render();let navigated=false;
    const go=()=>{if(navigated)return;navigated=true;try{if(popup&&!popup.closed)popup.location.replace(url);else window.location.assign(url);}catch{window.location.assign(url);}$('#send-status').textContent='Tu pedido está listo en WhatsApp. Recordá enviar el mensaje; el local confirma disponibilidad y entrega.';setTimeout(()=>{sending=false;render();},1800);};
    if(!duplicate&&analyticsReady&&consent==='yes'){
      window.gtag('event','generate_lead',{currency:'ARS',value:current.total,order_id:id,shipping:current.shipping,empanada_quantity:current.empanadas,pizza_quantity:current.items.filter(p=>p.category==='pizza').reduce((n,p)=>n+p.quantity,0),promotion:current.mode,delivery_type:delivery,lead_source:'whatsapp',event_callback:go,event_timeout:800});
      setTimeout(go,1000);
    }else go();
    lastSubmission={signature,id};
  });
  render();
})();
