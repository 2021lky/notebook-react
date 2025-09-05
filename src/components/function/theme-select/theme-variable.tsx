import { useState } from 'react'
import getThemeColors, { ThemeColor } from './theme-colors'

export type ModalPropsType = {
  data: ThemeColor
  onClose: () => void
  onSelect: (theme: ThemeColor) => void
}
const ThemeModal = ({
  data,
  onClose,
  onSelect,
}: ModalPropsType) => {
  const themeColors = getThemeColors()
  const [hover, setHover] = useState<string>(data?.value || '')
  const handleThemeChange = (data: ThemeColor) => {
    onSelect(data)
    onClose()
  }

  return (
    <div className="card w-32 p-2 bg-secondary-200 rounded-md boxShadow-sm">
      <div className="flex flex-col flex-wrap justify-center">
        {
            themeColors.map((item) => (
                <div
                  key={item.name}
                  className={`flex items-center px-2 rounded mb-1 ${hover === item.value ? 'bg-tertiary' : 'bg-primary-400'} cursor-pointer`}
                  onMouseEnter={() => setHover(item.value)}
                  onMouseLeave={() => setHover(data!.value)}
                  onClick={() => handleThemeChange(item)}
                >
                  <div 
                    style={{
                      backgroundColor: item.primary,
                      width: 16,
                      height: 16,
                      borderRadius: 50,
                      marginRight: 8,
                    }}
                  ></div>
                  <span className="text-text-primary">{item.name}</span>
                </div>
            ))
        }
      </div>
    </div>
  )
}

export default ThemeModal
