import { motion } from 'framer-motion'
import { blurFadeUp } from '@/lib/animations'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

const faqs = [
  { q: 'Funciona no celular?', a: 'Sim. O SimulaCotas é um PWA — funciona em qualquer celular Android ou iPhone, sem precisar baixar na loja. Basta acessar e instalar como app.' },
  { q: 'Precisa instalar alguma coisa?', a: 'Não. Funciona 100% no navegador. Opcionalmente, você pode adicionar à tela inicial do celular para usar como app nativo.' },
  { q: 'E se eu quiser cancelar?', a: 'Cancele a qualquer momento, sem multa. Seu acesso continua até o final do período pago. Dados preservados por 90 dias.' },
  { q: 'Funciona com qual administradora?', a: 'Itaú, Banco do Brasil, Santander, Magalu, Reconomia, Breitkopf e Âncora. Novas administradoras são adicionadas regularmente.' },
  { q: 'Os cálculos são confiáveis?', a: 'Sim. As fórmulas foram extraídas das planilhas oficiais do BB e Itaú e validadas com corretores reais do mercado.' },
  { q: 'Posso personalizar com minha marca?', a: 'Sim. Configure seu nome, logo, WhatsApp e cores. Toda proposta em PDF sai com sua identidade visual completa.' },
]

export default function FAQSection() {
  return (
    <section id="faq" className="relative py-20 bg-white overflow-hidden">
      {/* Blob */}
      <div className="gradient-blob gradient-blob-lime w-[350px] h-[350px] left-1/2 -translate-x-1/2 top-0 opacity-20" />
      <div className="mx-auto max-w-2xl px-6 relative z-10">
        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#0D1B4B] sm:text-4xl">Perguntas frequentes</h2>
        </motion.div>

        <motion.div variants={blurFadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ delay: 0.15 }}>
          <Accordion className="space-y-3">
            {faqs.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-premium-card border-none px-6 overflow-hidden">
                <AccordionTrigger className="text-sm font-bold text-[#0D1B4B] hover:no-underline py-5">{q}</AccordionTrigger>
                <AccordionContent className="text-sm text-gray-500 leading-relaxed pb-5">{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
