document.addEventListener('DOMContentLoaded',()=>{
  const nav=document.getElementById('nav');
  const btt=document.getElementById('btt');
  window.addEventListener('scroll',()=>{
    nav.classList.toggle('scrolled',window.scrollY>40);
    if(btt) btt.classList.toggle('show',window.scrollY>400);
  },{passive:true});
});
function openMenu(){document.getElementById('mobMenu').classList.add('open');document.body.style.overflow='hidden'}
function closeMenu(){document.getElementById('mobMenu').classList.remove('open');document.body.style.overflow=''}
function handleSubmit(form){
  const btn=form.querySelector('.f-submit');
  btn.innerHTML='<i class="fas fa-check"></i> Sent!';
  btn.style.background='linear-gradient(135deg,#10b981,#059669)';
  setTimeout(()=>{btn.innerHTML='<i class="fas fa-paper-plane"></i> Send Message';btn.style.background='';form.reset()},3200);
}
