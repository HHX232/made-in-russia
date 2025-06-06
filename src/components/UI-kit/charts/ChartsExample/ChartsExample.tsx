import React from 'react'
import {ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts'

interface SalesData {
  period: string
  itemsSold: number // Общее количество проданных позиций
  revenue: number // Общая выручка
}

const salesData: SalesData[] = [
  {
    period: '20 мая',
    itemsSold: 85,
    revenue: 170000
  },
  {
    period: '21 мая',
    itemsSold: 212,
    revenue: 624000
  },
  {
    period: '22 мая',
    itemsSold: 56,
    revenue: 312000
  },
  {
    period: '23 мая',
    itemsSold: 698,
    revenue: 796000
  },
  {
    period: '24 мая',
    itemsSold: 147,
    revenue: 134000
  },
  {
    period: '25 мая',
    itemsSold: 445,
    revenue: 890000
  },
  {
    period: '26 мая',
    itemsSold: 198,
    revenue: 396000
  },
  {
    period: '27 мая',
    itemsSold: 52,
    revenue: 104000
  },
  {
    period: '28 мая',
    itemsSold: 367,
    revenue: 734000
  },
  {
    period: '29 мая',
    itemsSold: 123,
    revenue: 246000
  },
  {
    period: '30 мая',
    itemsSold: 456,
    revenue: 912000
  },
  {
    period: '31 мая',
    itemsSold: 234,
    revenue: 468000
  },
  {
    period: '1 июня',
    itemsSold: 89,
    revenue: 178000
  },
  {
    period: '2 июня',
    itemsSold: 423,
    revenue: 846000
  },
  {
    period: '3 июня',
    itemsSold: 167,
    revenue: 334000
  },
  {
    period: '4 июня',
    itemsSold: 512,
    revenue: 1024000
  },
  {
    period: '5 июня',
    itemsSold: 45,
    revenue: 90000
  },
  {
    period: '6 июня',
    itemsSold: 378,
    revenue: 756000
  },
  {
    period: '7 июня',
    itemsSold: 289,
    revenue: 578000
  },
  {
    period: '8 июня',
    itemsSold: 534,
    revenue: 1068000
  }
]

const SalesChart: React.FC = () => {
  return (
    <ResponsiveContainer width='100%' height={500}>
      <ComposedChart
        data={salesData}
        margin={{
          top: 20,
          right: 60,
          bottom: 100,
          left: 60
        }}
      >
        <CartesianGrid stroke='#f5f5f5' />
        <XAxis
          dataKey='period'
          label={{
            value: 'Даты',
            position: 'insideBottomRight',
            offset: -10
          }}
          scale='band'
          angle={-45}
          textAnchor='end'
          height={80}
        />
        <YAxis
          yAxisId='left'
          label={{
            value: 'Продажи (шт)',
            angle: -90,
            position: 'insideLeft'
          }}
        />
        <YAxis
          yAxisId='right'
          orientation='right'
          label={{
            value: 'Выручка (руб)',
            angle: 90,
            position: 'insideRight',
            offset: -30
          }}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'Выручка') {
              return [`${new Intl.NumberFormat('ru-RU').format(Number(value))} ₽`, name]
            }
            return [value, name]
          }}
        />
        <Legend />

        {/* Область - выручка (рендерится первой, чтобы быть на заднем плане) */}
        <Area
          yAxisId='right'
          type='monotone'
          dataKey='revenue'
          name='Выручка'
          fill='#AC2525'
          stroke='#AC2525'
          fillOpacity={0.2}
        />

        {/* Столбцы - количество проданных позиций (рендерятся поверх области) */}
        <Bar yAxisId='left' dataKey='itemsSold' name='Продано позиций' barSize={30} fill='#2D5AA0' />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default SalesChart
