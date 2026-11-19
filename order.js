/* Lógica de precios compartida por la página y las pruebas. Importes en pesos ARS. */
(function (root) {
  'use strict';
  const products = [
    {id:'matambre',name:'Matambre',description:'Huevo duro y verdeo',ingredients:'Matambre, apio, cebolla, ajo, laurel, sal, pimienta en grano, verduras cocidas en grasa vacuna, huevo y verdeo.',category:'empanada'},
    {id:'dulce',name:'Dulce',description:'Pasa de uva',category:'empanada'},
    {id:'osobuco',name:'Osobuco',description:'Verduras, huevo y verdeo',ingredients:'Osobuco, vino tinto, caldo, verduras cocidas, huevo y verdeo.',category:'empanada'},
    {id:'vacio',name:'Vacío',description:'Verduras, huevo y verdeo · queso opcional',ingredients:'Vacío, caldo, verduras cocidas, huevo y verdeo. Queso opcional.',category:'empanada',cheese:true},
    {id:'bondiola',name:'Bondiola',description:'Verduras, huevo y verdeo · queso opcional',ingredients:'Bondiola, cerveza negra, caldo, verduras cocidas, huevo y verdeo. Queso opcional.',category:'empanada',cheese:true},
    {id:'verdura',name:'Verdura',description:'Acelga o espinaca, salsa blanca y queso',ingredients:'Acelga o espinaca, manteca, cebolla, morrón, harina, leche y queso cremoso.',category:'empanada'},
    {id:'saltena',name:'Salteñas',description:'Carne, papa, huevo y verdeo',ingredients:'Carne de nalga o lomo, papa hervida, verduras cocidas en grasa vacuna, comino, huevo y verdeo.',category:'empanada'},
    {id:'salada',name:'Saladas',description:'Huevo y verdeo',category:'empanada'},
    {id:'picante',name:'Picantes',description:'Verdeo',category:'empanada'},
    {id:'pollo',name:'Pollo',description:'Huevo, verdeo y salsa blanca',ingredients:'Pechuga de pollo, laurel, sal, pimienta en grano, huevo, verdeo y salsa blanca.',category:'empanada'},
    {id:'choclo',name:'Choclo',description:'Salsa blanca y verdeo',ingredients:'Choclo, manteca, cebolla, verdeo, harina, leche y queso cremoso.',category:'empanada'},
    {id:'roquefort',name:'Roquefort',description:'Salsa blanca',category:'empanada'},
    {id:'calabaza',name:'Calabaza',description:'Calabaza',category:'empanada'},
    {id:'capresse',name:'Capresse',description:'Capresse',category:'empanada'},
    {id:'jamon-queso',name:'Jamón y queso',description:'Jamón y queso',category:'empanada'},
    {id:'empanada-cuatro-quesos',name:'4 quesos',description:'Cuatro quesos',category:'empanada'},
    {id:'chorizo-pomarola',name:'Chorizo a la pomarola',description:'Chorizo a la pomarola',category:'empanada'},
    {id:'cheeseburger',name:'Cheeseburger',description:'Cheeseburger',category:'empanada'},
    {id:'muzza',name:'Muzza',category:'pizza',price:10000},
    {id:'napolitana',name:'Napolitana',category:'pizza',price:14000},
    {id:'especial',name:'Especial',category:'pizza',price:14000},
    {id:'huevo',name:'Huevo',category:'pizza',price:14000},
    {id:'cuatro-quesos',name:'Cuatro quesos',category:'pizza',price:16000}
  ];
  const money = value => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value);
  function calculate(cart, promo, delivery, config) {
    const items = products.flatMap(p=>{
      const variants = p.cheese ? [false,true].map(withCheese=>({withCheese,cartKey:`${p.id}-${withCheese?'con':'sin'}-queso`})) : [{withCheese:false,cartKey:p.id}];
      return variants.map(variant=>({...p,...variant,quantity:Math.min(120,Math.max(0,Math.floor(Number(cart[variant.cartKey]?.quantity)||0)))}));
    }).filter(p=>p.quantity);
    const empanadas = items.filter(p=>p.category==='empanada').reduce((sum,p)=>sum+p.quantity,0);
    const pizzas = items.filter(p=>p.category==='pizza').reduce((sum,p)=>sum+p.price*p.quantity,0);
    const mode = ['dozen','combo'].includes(promo) ? promo : empanadas>=12 ? 'dozen' : 'units';
    const promoIncomplete = mode!=='units' && empanadas<12;
    const dozens = mode==='units' ? 0 : Math.floor(empanadas/12);
    const extras = empanadas-dozens*12;
    const empanadaTotal = dozens*(mode==='combo'?config.comboPrice:config.dozenPrice)+extras*config.unitPrice;
    const shipping = items.length && delivery==='delivery' ? config.deliveryPrice : 0;
    return {items,empanadas,pizzas,mode,promoIncomplete,dozens,extras,empanadaTotal,shipping,quantity:items.reduce((n,p)=>n+p.quantity,0),subtotal:empanadaTotal+pizzas,total:empanadaTotal+pizzas+shipping};
  }
  function message(order,customer,config) {
    const lines = ['¡Hola, Punto Empanadas! 🥟','Quiero hacer este pedido:',''];
    if(order.empanadas){lines.push('*EMPANADAS*');order.items.filter(p=>p.category==='empanada').forEach(p=>lines.push(`• ${p.quantity} × ${p.name}${p.cheese ? (p.withCheese?' (con queso)':' (sin queso)') : ''}`));
      if(order.dozens) lines.push(`${order.dozens} × ${order.mode==='combo'?'Docena + Pritty de 2,25 L':'Docena de empanadas'}: ${money(order.dozens*(order.mode==='combo'?config.comboPrice:config.dozenPrice))}`);
      if(order.extras) lines.push(`${order.extras} unidades a ${money(config.unitPrice)}: ${money(order.extras*config.unitPrice)}`);
      lines.push(`Subtotal empanadas${order.mode==='combo'?' + bebida':''}: ${money(order.empanadaTotal)}`,'');}
    if(order.pizzas){lines.push('*PIZZAS*');order.items.filter(p=>p.category==='pizza').forEach(p=>lines.push(`• ${p.quantity} × ${p.name}: ${money(p.quantity*p.price)}`));lines.push('');}
    lines.push(`*Nombre:* ${customer.name}`,`*Entrega:* ${customer.delivery==='delivery'?'Envío a domicilio':'Retiro en Córdoba 1390, esquina Honduras'}`);
    if(customer.delivery==='delivery') lines.push(`*Dirección:* ${customer.address}`);
    lines.push(`*Pago:* ${customer.payment}`);
    if(customer.notes) lines.push(`*Aclaraciones:* ${customer.notes}`);
    lines.push('',`Subtotal: ${money(order.subtotal)}`,`Envío: ${order.shipping?money(order.shipping):'Sin costo'}`,`*TOTAL: ${money(order.total)}*`,'','Aguardo confirmación de disponibilidad y tiempo de entrega. ¡Gracias!');
    return lines.join('\n');
  }
  root.PuntoOrder = {products,money,calculate,message};
})(typeof window==='undefined'?globalThis:window);
