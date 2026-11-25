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
    {id:'muzza',name:'Muzzarella',ingredients:'Muzzarella y orégano.',category:'pizza',price:10000},
    {id:'napolitana',name:'Napolitana',ingredients:'Muzzarella, tomate y ajo.',category:'pizza',price:14000},
    {id:'especial',name:'Especial',ingredients:'Muzzarella, jamón y huevo.',category:'pizza',price:14000},
    {id:'huevo',name:'Huevo',ingredients:'Huevo y orégano.',category:'pizza',price:14000},
    {id:'cuatro-quesos',name:'4 quesos',ingredients:'Muzzarella, sardo, cremoso y roquefort.',category:'pizza',price:16000},
    {id:'fugazzeta',name:'Fugazzeta',ingredients:'Cebolla caramelizada y orégano.',category:'pizza',price:14000},
    {id:'pizza-roquefort',name:'Roquefort',ingredients:'Muzzarella y roquefort.',category:'pizza',price:16000},
    {id:'aquarius-manzana-500',name:'Aquarius Manzana 500 ml',description:'Botella de 500 ml',image:'assets/aquarius-manzana-500.png',category:'bebida',price:2200},
    {id:'aquarius-manzana-1500',name:'Aquarius Manzana 1,5 L',description:'Botella de 1,5 L',image:'assets/aquarius-manzana-1500.png',category:'bebida',price:4400},
    {id:'aquarius-pera-500',name:'Aquarius Pera 500 ml',description:'Botella de 500 ml',image:'assets/aquarius-pera-500.png',category:'bebida',price:2200},
    {id:'aquarius-pera-1500',name:'Aquarius Pera 1,5 L',description:'Botella de 1,5 L',image:'assets/aquarius-pera-1500.png',category:'bebida',price:4400},
    {id:'brahma-1000',name:'Cerveza Brahma 1 L',description:'Botella de 1 L',image:'assets/brahma-1000.png',category:'bebida',price:5000},
    {id:'quilmes-1000',name:'Cerveza Quilmes 1 L',description:'Botella de 1 L',image:'assets/quilmes-1000.png',category:'bebida',price:5000},
    {id:'schneider-710',name:'Cerveza Schneider 710 ml',description:'Lata de 710 ml',image:'assets/schneider-710.png',category:'bebida',price:3500},
    {id:'coca-lata-354',name:'Coca-Cola lata 354 ml',description:'Lata de 354 ml',image:'assets/coca-lata-354.png',category:'bebida',price:1900},
    {id:'coca-500',name:'Coca-Cola 500 ml',description:'Botella de 500 ml',image:'assets/coca-500.png',category:'bebida',price:2200},
    {id:'coca-1000',name:'Coca-Cola 1 L',description:'Botella de 1 L',image:'assets/coca-1000.png',category:'bebida',price:3900},
    {id:'coca-1500',name:'Coca-Cola 1,5 L',description:'Botella de 1,5 L',image:'assets/coca-1500.png',category:'bebida',price:5000},
    {id:'coca-2500',name:'Coca-Cola 2,5 L',description:'Botella de 2,5 L',image:'assets/coca-2500.png',category:'bebida',price:6900},
    {id:'coca-retornable-2500',name:'Coca-Cola retornable 2,5 L',description:'Botella retornable de 2,5 L',image:'assets/coca-retornable-2500.png',category:'bebida',price:5800},
    {id:'pritty-2250',name:'Pritty 2,25 L',description:'Botella de 2,25 L',image:'assets/pritty-2250.png',category:'bebida',price:3100},
    {id:'sprite-500',name:'Sprite 500 ml',description:'Botella de 500 ml',image:'assets/sprite-500.png',category:'bebida',price:2200},
    {id:'sprite-1500',name:'Sprite 1,5 L',description:'Botella de 1,5 L',image:'assets/sprite-1500.png',category:'bebida',price:5000},
    {id:'sprite-2500',name:'Sprite 2,5 L',description:'Botella de 2,5 L',image:'assets/sprite-2500.png',category:'bebida',price:6800},
    {id:'sprite-retornable-2000',name:'Sprite retornable 2 L',description:'Botella retornable de 2 L',image:'assets/sprite-retornable-2000.png',category:'bebida',price:4900},
    {id:'promo-pizzas-coca',name:'2 pizzas + Coca-Cola 2,5 L',description:'1 pizza Muzzarella + 1 pizza Especial + 1 Coca-Cola de 2,5 L.',category:'promotion',price:28000}
  ];
  const money = value => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(value);
  function calculate(cart, promo, delivery, config) {
    const items = products.flatMap(p=>{
      const variants = p.cheese ? [false,true].map(withCheese=>({withCheese,cartKey:`${p.id}-${withCheese?'con':'sin'}-queso`})) : [{withCheese:false,cartKey:p.id}];
      return variants.map(variant=>({...p,...variant,quantity:Math.min(120,Math.max(0,Math.floor(Number(cart[variant.cartKey]?.quantity)||0)))}));
    }).filter(p=>p.quantity);
    const empanadas = items.filter(p=>p.category==='empanada').reduce((sum,p)=>sum+p.quantity,0);
    const pizzas = items.filter(p=>p.category==='pizza').reduce((sum,p)=>sum+p.price*p.quantity,0);
    const beverages = items.filter(p=>p.category==='bebida').reduce((sum,p)=>sum+p.price*p.quantity,0);
    const promotions = items.filter(p=>p.category==='promotion').reduce((sum,p)=>sum+p.price*p.quantity,0);
    const mode = ['half','dozen','combo'].includes(promo) ? promo : empanadas>=12 ? 'dozen' : 'units';
    const promoTarget = mode==='half' ? 6 : 12;
    const promoIncomplete = mode!=='units' && empanadas<promoTarget;
    const halfDozens = mode==='half' ? Math.floor(empanadas/6) : 0;
    const dozens = mode==='units'||mode==='half' ? 0 : Math.floor(empanadas/12);
    const extras = empanadas-halfDozens*6-dozens*12;
    const empanadaTotal = halfDozens*config.halfComboPrice+dozens*(mode==='combo'?config.comboPrice:config.dozenPrice)+extras*config.unitPrice;
    const shipping = items.length && delivery==='delivery' ? config.deliveryPrice : 0;
    return {items,empanadas,pizzas,beverages,promotions,mode,promoTarget,promoIncomplete,halfDozens,dozens,extras,empanadaTotal,shipping,quantity:items.reduce((n,p)=>n+p.quantity,0),subtotal:empanadaTotal+pizzas+beverages+promotions,total:empanadaTotal+pizzas+beverages+promotions+shipping};
  }
  function message(order,customer,config) {
    const lines = ['¡Hola, Punto Empanadas! 🥟','Quiero hacer este pedido:',''];
    if(order.empanadas){lines.push('*EMPANADAS*');order.items.filter(p=>p.category==='empanada').forEach(p=>lines.push(`• ${p.quantity} × ${p.name}${p.cheese ? (p.withCheese?' (con queso)':' (sin queso)') : ''}`));
      if(order.halfDozens) lines.push(`${order.halfDozens} × Media docena + Coca-Cola 600 ml: ${money(order.halfDozens*config.halfComboPrice)}`);
      if(order.dozens) lines.push(`${order.dozens} × ${order.mode==='combo'?'Docena + Pritty de 2,25 L':'Docena de empanadas'}: ${money(order.dozens*(order.mode==='combo'?config.comboPrice:config.dozenPrice))}`);
      if(order.extras) lines.push(`${order.extras} unidades a ${money(config.unitPrice)}: ${money(order.extras*config.unitPrice)}`);
      lines.push(`Subtotal empanadas${order.mode==='combo'?' + bebida':''}: ${money(order.empanadaTotal)}`,'');}
    if(order.pizzas){lines.push('*PIZZAS*');order.items.filter(p=>p.category==='pizza').forEach(p=>lines.push(`• ${p.quantity} × ${p.name}: ${money(p.quantity*p.price)}`));lines.push('');}
    if(order.beverages){lines.push('*BEBIDAS*');order.items.filter(p=>p.category==='bebida').forEach(p=>lines.push(`• ${p.quantity} × ${p.name}: ${money(p.quantity*p.price)}`));lines.push('');}
    if(order.promotions){lines.push('*PROMOCIONES*');order.items.filter(p=>p.category==='promotion').forEach(p=>{lines.push(`• ${p.quantity} × ${p.name}: ${money(p.quantity*p.price)}`);lines.push(`  ${p.description}`);});lines.push('');}
    lines.push(`*Nombre:* ${customer.name}`,`*Entrega:* ${customer.delivery==='delivery'?'Envío a domicilio':'Retiro en Córdoba 1390, esquina Honduras'}`);
    if(customer.delivery==='delivery') lines.push(`*Dirección:* ${customer.address}`);
    lines.push(`*Pago:* ${customer.payment}`);
    if(customer.notes) lines.push(`*Aclaraciones:* ${customer.notes}`);
    lines.push('',`Subtotal: ${money(order.subtotal)}`,`Envío: ${order.shipping?money(order.shipping):'Sin costo'}`,`*TOTAL: ${money(order.total)}*`,'','Aguardo confirmación de disponibilidad y tiempo de entrega. ¡Gracias!');
    return lines.join('\n');
  }
  root.PuntoOrder = {products,money,calculate,message};
})(typeof window==='undefined'?globalThis:window);
