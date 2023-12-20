import { useMemo } from 'react';



import Icons from '@components/Icons';
import { Button, ButtonProps } from 'antd';


type Color = 'green' | 'blue' | 'purple' | 'red' | 'framer'

interface ColorMap {
  [key: string]: string
}

interface GradientButtonProps extends ButtonProps {
  color: Color
}
const gdMap: { [key: string]: ColorMap } = {
  gdbg: {
    green:
      'bg-gradient-to-r from-teal-600 to-green-300 hover:from-teal-500 hover:to-green-300 active:from-teal-600 active:to-green-400',
    blue: 'bg-gradient-to-r from-blue-600 to-cyan-300 hover:from-blue-500 hover:to-cyan-300 active:from-blue-600 active:to-cyan-400',
    purple:
      'bg-gradient-to-r from-violet-600 to-pink-300 hover:from-violet-500 hover:to-pink-300 active:from-violet-600 active:to-pink-400',
    red: 'bg-gradient-to-r from-rose-600 to-amber-300 hover:from-rose-500 hover:to-amber-300 active:from-rose-600 active:to-amber-400',
    framer:
      'bg-gradient-to-r from-blue-framer to-purple-framer hover:from-blue-framerhover hover:to-purple-framerhover active:from-blue-frameractive active:to-purple-frameractive'
  },
  gdborder: {
    green: '[--start-color:theme(colors.teal.600)] [--end-color:theme(colors.green.300)]',
    blue: '[--start-color:theme(colors.blue.600)] [--end-color:theme(colors.cyan.300)]',
    purple: '[--start-color:theme(colors.violet.600)] [--end-color:theme(colors.pink.300)]',
    red: '[--start-color:theme(colors.rose.600)] [--end-color:theme(colors.amber.300)]'
  }
}
function gd(color: string) {
  return [gdMap.gdbg[color], gdMap.gdborder[color]]
}

export default function GradientButton({
  color,
  ghost,
  className,
  // disabled,
  children,
  ...otherProps
}: GradientButtonProps) {
  const [gradientBgClass, gradientBorderClass] = useMemo(() => gd(color), [color])

  return (
    <div className={`gradient-button-wrapper flex w-full justify-center ${ghost ? gradientBorderClass : ''}`}>
      {ghost && <span className={`gradient-btn-bg  ${otherProps.disabled ? 'grayscale-[0.8]' : ''}`}></span>}
      <Button
        size="large"
        type="primary"
        className={` flex min-w-[200px] items-center justify-center ${
          ghost
            ? 'border border-solid border-transparent bg-white bg-clip-padding text-neutral-900 hover:!bg-transparent active:!bg-transparent dark:bg-black dark:text-neutral-100'
            : `border-none ${gradientBgClass}`
        } ${className}`}
        {...otherProps}
      >
        {children}
      </Button>
    </div>
  )
}