// Static inline script to prevent flash of unstyled content on dark mode.
// This script only reads localStorage and matchMedia — it contains no user input
// and poses no XSS risk as the content is a hardcoded constant string.
export function ThemeScript() {
  const themeScript = `(function(){try{var d=document.documentElement;var m=localStorage.getItem('theme');if(m==='dark'||((!m||m==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches)){d.classList.add('dark')}else{d.classList.add('light')}}catch(e){}})()`;
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
