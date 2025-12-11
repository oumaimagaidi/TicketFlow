import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function TawkToChat() {
  const { user } = useAuth();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;

    console.log('💬 Initialisation du chat Tawk.to...');

    // Votre code Tawk.to
    const script = document.createElement('script');
    script.innerHTML = `
      var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
      (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/693a1f44f831981980dd35e3/1jc5gk9o0';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
      })();
    `;
    
    script.id = 'tawk-chat-script';

    script.onload = () => {
      console.log('✅ Chat Tawk.to chargé');
      isInitialized.current = true;

     
      const checkAPI = setInterval(() => {
        if (window.Tawk_API) {
          clearInterval(checkAPI);
          
          // Configurer l'événement onLoad
          if (window.Tawk_API.onLoad) {
            window.Tawk_API.onLoad = () => {
              console.log('🎯 Widget Tawk.to prêt');
              
              // Mettre à jour les infos utilisateur
              if (user && window.Tawk_API?.setAttributes) {
                setTimeout(() => {
                  window.Tawk_API.setAttributes({
                    name: user.name || 'Utilisateur',
                    email: user.email || '',
                    role: user.role || 'user',
                  }, (error: any) => {
                    if (error) console.warn('Tawk.to error:', error);
                  });
                }, 1000);
              }
            };
          }
        }
      }, 100);
    };

    script.onerror = (error) => {
      console.error('❌ Erreur Tawk.to:', error);
    };

    document.head.appendChild(script);

    // Nettoyage simple
    return () => {
      const script = document.getElementById('tawk-chat-script');
      if (script) script.remove();
    };
  }, [user]);

  return null;
}