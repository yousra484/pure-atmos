import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Send
} from 'lucide-react';
import { translations } from '@/utils/translations';
import { useAppContext } from '@/context/AppContext';

export function Footer() {
  const { language } = useAppContext();
  const t = translations[language as keyof typeof translations];

  return (
    <footer className="bg-atmos-dark text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <img 
                src="public/lovable-uploads/eefd4b80-ad21-48be-86d4-442a67f14076.png" 
                alt="Pure Atmos Logo" 
                className="h-12 w-auto brightness-0 invert"
              />
              <div>
                <h3 className="text-xl font-bold">Pure Atmos</h3>
                <p className="text-sm text-gray-300">Solutions Services</p> 
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 max-w-md">
              {t.footerDescription}
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-atmos-green" />
                <span>+213 559 34 54 40</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-atmos-green" />
                <span>pureatmos@gmail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-atmos-green mt-1" />
                <span>Université de Tlemcen, Abou Bekr Belkaid<br />Département de Biologie</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t.quickLinks}</h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-300 hover:text-atmos-green transition-colors">
                  {t.home}
                </a>
              </li>
              <li>
                <a href="/services" className="text-gray-300 hover:text-atmos-green transition-colors">
                  {t.services}
                </a>
              </li>
              <li>
                <a href="/countries" className="text-gray-300 hover:text-atmos-green transition-colors">
                  {t.countries}
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-atmos-green transition-colors">
                  {t.about}
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-atmos-green transition-colors">
                  {t.contact}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6">{t.newsletter}</h4>
            <p className="text-gray-300 mb-4 text-sm">
              {t.newsletterDesc}
            </p>
            <div className="flex gap-2">
              <Input 
                placeholder={t.emailPlaceholder}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button size="sm" className="bg-atmos-green hover:bg-atmos-green/90">
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="font-medium mb-3">{t.followUs}</h5>
              <div className="flex gap-3">
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-atmos-green hover:border-atmos-green">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-atmos-green hover:border-atmos-green">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-atmos-green hover:border-atmos-green">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-atmos-green hover:border-atmos-green">
                  <Instagram className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 text-sm text-center md:text-left">
              {t.copyright}
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-300 hover:text-atmos-green transition-colors">
                {t.legalNotices}
              </a>
              <a href="#" className="text-gray-300 hover:text-atmos-green transition-colors">
                {t.privacyPolicy}
              </a>
              <a href="#" className="text-gray-300 hover:text-atmos-green transition-colors">
                {t.terms}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}