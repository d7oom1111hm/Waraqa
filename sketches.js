export const sketchNames = ['حديقة على ورق','فراشة وبتلات','قهوة وهدوء','بيوت بين التلال','باقة صغيرة','عالم تحت البحر'];
export function drawSketch(c, seed=0) {
  c.save(); c.strokeStyle='#8a8d80'; c.globalAlpha=.48; c.lineWidth=1.4; c.lineCap='round'; c.lineJoin='round';
  const line=(...p)=>{c.beginPath();c.moveTo(p[0],p[1]);for(let i=2;i<p.length;i+=2)c.lineTo(p[i],p[i+1]);c.stroke();};
  const ellipse=(x,y,rx,ry,r=0)=>{c.beginPath();c.ellipse(x,y,rx,ry,r,0,Math.PI*2);c.stroke();};
  const curve=(x,y,a,b,d,e,f,g)=>{c.beginPath();c.moveTo(x,y);c.bezierCurveTo(a,b,d,e,f,g);c.stroke();};
  const leaf=(x,y,dir=1)=>{curve(x,y,x+dir*65,y-80,x+dir*140,y-45,x+dir*85,y+2);curve(x+dir*85,y+2,x+dir*45,y+25,x+dir*15,y+18,x,y);line(x,y,x+dir*85,y-20);};
  const flower=(x,y,r=65,n=9)=>{for(let i=0;i<n;i++){let a=i*Math.PI*2/n;ellipse(x+Math.cos(a)*r*.87,y+Math.sin(a)*r*.87,r*.62,r*.27,a);}ellipse(x,y,r*.35,r*.35);for(let i=0;i<13;i++){let a=i*2.4;ellipse(x+Math.cos(a)*r*.22,y+Math.sin(a)*r*.22,1.5,1.5);}};
  const stem=(x,y,h,r)=>{curve(x,y,x-30,y+h*.5,x+40,y+h*.6,x,y+h);leaf(x+5,y+h*.48,1);leaf(x,y+h*.72,-1);flower(x,y,r);};
  switch(seed%6){
  case 0:
    stem(600,250,460,95);stem(370,370,340,70);stem(810,355,355,80);stem(245,510,200,45);stem(935,485,225,50);
    curve(195,723,430,690,790,760,1010,718);curve(305,753,430,730,820,790,898,749);
    for(const [x,y] of [[220,255],[930,235],[720,130],[410,170]]){ellipse(x,y,4,4);line(x-14,y,x+14,y);line(x,y-14,x,y+14);}break;
  case 1:
    ellipse(600,455,22,150);curve(588,315,520,215,520,220,545,290);curve(612,315,680,215,680,220,655,290);
    for(const d of [-1,1]){c.save();c.translate(600,430);c.scale(d,1);curve(20,0,160,-320,460,-210,250,40);curve(250,40,460,340,80,290,20,0);curve(25,10,170,-200,330,-150,205,20);curve(25,40,260,60,230,245,70,180);ellipse(160,-60,35,60,.7);ellipse(150,120,30,45,-.5);c.restore();}flower(230,700,50);flower(960,680,60);flower(300,220,37);flower(900,190,33);break;
  case 2:
    ellipse(600,665,285,65);ellipse(600,648,235,45);line(420,370,442,610);curve(442,610,450,680,750,680,758,610);line(758,610,780,370);ellipse(600,370,180,46);ellipse(600,374,155,29);curve(780,420,960,360,910,610,765,560);curve(788,450,895,410,865,555,775,530);
    for(let i=0;i<3;i++)curve(520+i*80,280,450+i*80,235,610+i*60,200,530+i*80,145);leaf(275,575,-1);line(250,650,285,470);flower(290,450,45);line(850,715,980,635,1010,655,880,735,850,715);break;
  case 3:
    curve(70,625,260,430,430,740,620,560);curve(620,560,830,400,950,530,1130,600);curve(80,750,400,580,850,800,1120,675);ellipse(865,235,75,75);
    for(const [x,y,s] of [[300,460,1],[650,440,.8],[890,550,.65]]){c.save();c.translate(x,y);c.scale(s,s);line(-100,0,0,-110,100,0,-100,0,-100,170,100,170,100,0);line(-22,170,-22,80,22,80,22,170);line(-70,25,-35,25,-35,60,-70,60,-70,25);line(35,25,70,25,70,60,35,60,35,25);c.restore();}for(const x of [140,525,1050]){line(x,620,x,435);ellipse(x,420,45,80);}break;
  case 4:
    line(430,540,485,780,715,780,770,540);ellipse(600,540,170,30);curve(480,650,560,700,650,600,730,640);
    for(const [x,y,r] of [[380,360,65],[580,250,80],[800,340,70],[590,430,55],[730,200,43]]){line(x,y+35,600,545);flower(x,y,r);}leaf(450,480,-1);leaf(730,460,1);break;
  case 5:
    for(const [x,y,s] of [[380,330,1],[800,470,.8],[460,610,.55]]){c.save();c.translate(x,y);c.scale(s,s);ellipse(0,0,145,85);line(130,0,220,-90,220,90,130,0);ellipse(-80,-15,9,9);curve(-45,-70,-5,0,-5,0,-45,70);curve(-25,-80,20,-150,65,-120,80,-65);c.restore();}for(const x of [180,250,920,1010])curve(x,790,x-90,610,x+90,680,x,580);for(const [x,y]of [[180,180],[210,240],[900,220],[940,150],[730,690]])ellipse(x,y,14,14);curve(130,800,450,760,800,830,1080,790);break;
  }c.restore();
}
