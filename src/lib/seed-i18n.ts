import { db } from '@/lib/db'

const CURRENCIES = [
  { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$', flag: '🇺🇸', sortOrder: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', sortOrder: 2 },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', flag: '🇨🇱', sortOrder: 3 },
  { code: 'MXN', name: 'Peso Mexicano', symbol: 'MX$', flag: '🇲🇽', sortOrder: 4 },
  { code: 'COP', name: 'Peso Colombiano', symbol: 'COL$', flag: '🇨🇴', sortOrder: 5 },
  { code: 'ARS', name: 'Peso Argentino', symbol: 'AR$', flag: '🇦🇷', sortOrder: 6 },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', flag: '🇵🇪', sortOrder: 7 },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷', sortOrder: 8 },
  { code: 'VES', name: 'Bolívar Venezolano', symbol: 'Bs.', flag: '🇻🇪', sortOrder: 9 },
]

export async function seedCurrencies() {
  try {
    for (const currency of CURRENCIES) {
      await db.currency.upsert({
        where: { code: currency.code },
        update: {
          name: currency.name,
          symbol: currency.symbol,
          flag: currency.flag,
          sortOrder: currency.sortOrder,
          isActive: true,
        },
        create: {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
          flag: currency.flag,
          sortOrder: currency.sortOrder,
          isActive: true,
        },
      })
    }
    console.log('✅ Currencies seeded:', CURRENCIES.map(c => c.code).join(', '))
  } catch (error) {
    console.error('❌ Failed to seed currencies:', error)
  }
}
