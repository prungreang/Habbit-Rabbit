/** Runs before paint so a dark-mode visitor never sees a white flash. */
export function ThemeScript() {
  const code = `(function(){try{var s=localStorage.getItem('hr-theme');var d=s?s==='dark':matchMedia('(prefers-color-scheme: dark)').matches;if(d){document.documentElement.classList.add('dark');document.documentElement.style.colorScheme='dark'}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
