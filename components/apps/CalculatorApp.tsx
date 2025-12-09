import React, { useState } from 'react';
import { AppProps } from '../../types';
import { Delete } from 'lucide-react';

export const CalculatorApp: React.FC<AppProps> = () => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isNewNumber, setIsNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (isNewNumber) {
      setDisplay(num);
      setIsNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setIsNewNumber(true);
  };

  const handleEqual = () => {
    const fullEquation = `${equation}${display}`;
    try {
      // eslint-disable-next-line no-eval
      const result = eval(fullEquation.replace('×', '*').replace('÷', '/'));
      setDisplay(String(result));
      setEquation('');
      setIsNewNumber(true);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsNewNumber(true);
  };

  const buttons = [
    { label: 'C', onClick: handleClear, className: 'col-span-1 bg-red-500/20 text-red-400 hover:bg-red-500/30' },
    { label: '÷', onClick: () => handleOperator('/'), className: 'bg-slate-700 text-cyan-400' },
    { label: '×', onClick: () => handleOperator('*'), className: 'bg-slate-700 text-cyan-400' },
    { label: '⌫', onClick: () => setDisplay(display.length > 1 ? display.slice(0, -1) : '0'), className: 'bg-slate-700 text-slate-300' },
    
    { label: '7', onClick: () => handleNumber('7') },
    { label: '8', onClick: () => handleNumber('8') },
    { label: '9', onClick: () => handleNumber('9') },
    { label: '-', onClick: () => handleOperator('-'), className: 'bg-slate-700 text-cyan-400' },

    { label: '4', onClick: () => handleNumber('4') },
    { label: '5', onClick: () => handleNumber('5') },
    { label: '6', onClick: () => handleNumber('6') },
    { label: '+', onClick: () => handleOperator('+'), className: 'bg-slate-700 text-cyan-400' },

    { label: '1', onClick: () => handleNumber('1') },
    { label: '2', onClick: () => handleNumber('2') },
    { label: '3', onClick: () => handleNumber('3') },
    { label: '=', onClick: handleEqual, className: 'row-span-2 bg-cyan-600 text-white hover:bg-cyan-500' },

    { label: '0', onClick: () => handleNumber('0'), className: 'col-span-2' },
    { label: '.', onClick: () => handleNumber('.') },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 select-none">
      <div className="flex-1 flex flex-col items-end justify-end p-6 bg-slate-950 text-right break-all">
        <div className="text-slate-500 text-sm h-6">{equation}</div>
        <div className="text-4xl font-light text-white">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-800">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            className={`
              h-14 rounded transition-colors text-xl font-medium
              ${btn.className || 'bg-slate-800 hover:bg-slate-700 text-slate-200'}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};