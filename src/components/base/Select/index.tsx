'use client'
import type { FC } from 'react'
import React, { useEffect, useState, useMemo } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { RiCheckLine, RiArrowDownSLine, RiArrowUpSLine, RiCloseLine } from '@remixicon/react'


const defaultItems = [
  { value: "1", name: 'option1' },
  { value: "2", name: 'option2' },
  { value: "3", name: 'option3' },
  { value: "4", name: 'option4' },
  { value: "5", name: 'option5' },
  { value: "6", name: 'option6' },
  { value: "7", name: 'option7' },
]

export type Item = {
  value: string
  name: string
} & Record<string, any>

export type ISelectProps = {
  className?: string
  wrapperClassName?: string
  renderTrigger?: (value: Item | null) => React.JSX.Element | null
  items?: Item[]
  defaultValue?: number | string
  disabled?: boolean
  onSelect: (value: Item) => void
  allowSearch?: boolean
  bgClassName?: string
  placeholder?: string
  overlayClassName?: string  // 下拉面板的自定义类名
  optionWrapClassName?: string  // 选项容器的自定义类名
  optionClassName?: string  // 单个选项的自定义类名
  hideChecked?: boolean  // 是否隐藏选中状态的勾选图标
  notClearable?: boolean  // 是否不允许清除选中项
  renderOption?: ({
    item,
    selected,
  }: {
    item: Item
    selected: boolean
  }) => React.ReactNode  // 自定义选项渲染函数
}

// 带搜索功能的下拉框
const Select: FC<ISelectProps> = ({
  className,
  items = defaultItems,
  defaultValue = 1,
  disabled = false,
  onSelect,
  allowSearch = true,
  bgClassName = 'bg-white',
  overlayClassName,
  optionClassName,
  renderOption,
}) => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  
  useEffect(() => {
    let defaultSelect = null
    const existed = items.find((item: Item) => item.value === defaultValue)
    if (existed)
      defaultSelect = existed

    setSelectedItem(defaultSelect)
  }, [defaultValue, items]) // 变更：加入 items 依赖
  
  // 获得筛选后的选项
  const filteredItems: Item[] = useMemo(() => {
    return query === '' 
      ? items 
      : items.filter((item) => 
          item.name.toLowerCase().includes(query.toLowerCase())
        );
  }, [query, items]);
  
  return (
    <Combobox
      as="div"
      disabled={disabled}
      value={selectedItem}
      className={className}
      onChange={(value: Item) => {
        if (!disabled) {
          setSelectedItem(value)
          setOpen(false)
          setQuery('') // 变更：选中后清空 query，避免覆盖显示
          onSelect(value)
        }
      }}>
      <div className='relative'>
        <div className='group text-text-secondary'>
          {allowSearch
            ? <ComboboxInput
              className={`w-full rounded-lg border-0 ${bgClassName} py-1.5 pl-3 pr-10 shadow-sm focus-visible:bg-primary-50 focus-visible:outline-none group-hover:bg-primary-50 sm:text-sm sm:leading-6 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onChange={(event) => {
                if (!disabled) {
                  setQuery(event.target.value)
                  setOpen(true) // 变更：输入时展开下拉
                }
              }}
              displayValue={(item: Item) => ( // 展示的内容
                query !== '' ? query : (item?.name ?? '')
              )}
            />
            : <ComboboxButton onClick={
              () => {
                if (!disabled)
                  setOpen(!open)
              }
            } className={`flex items-center h-9 w-full rounded-lg border-0 ${bgClassName} py-1.5 pl-3 pr-10 shadow-sm sm:text-sm sm:leading-6 focus-visible:outline-none focus-visible:bg-primary-50 group-hover:bg-primary-50 ${optionClassName}`}>
              <div className='w-0 grow truncate text-left' title={selectedItem?.name}>{selectedItem?.name}</div>
            </ComboboxButton>
          }
          {/* 下拉箭头按钮（控制展开/收起），绝对定位在右侧 */}
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none" onClick={
            () => {
              if (!disabled)
                setOpen(!open)
            }
          }>
            {open ? <RiArrowUpSLine className="h-5 w-5" /> : <RiArrowDownSLine className="h-5 w-5" />}
          </ComboboxButton>
        </div>

        {(filteredItems.length > 0 && open) && (
          <ComboboxOptions className={`absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border-[0.5px] border-primary bg-white px-1 py-1 text-base shadow-lg backdrop-blur-sm focus:outline-none sm:text-sm ${overlayClassName}`}>
            {filteredItems.map((item: Item) => (
              <ComboboxOption
                key={item.value}
                value={item}
                className={({ active }: { active: boolean }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 rounded-lg hover:bg-primary-50 text-text-secondary 
                  ${ active ? 'bg-primary-50' : ''} 
                  ${optionClassName}`
                }
              >
                {({ /* active, */ selected }) => (
                  <>
                    {renderOption
                      ? renderOption({ item, selected })
                      : (
                        <>
                          <span className={`block ${selected && 'font-normal'}`}>{item.name}</span>
                          {selected && (
                            <span
                              className={`absolute inset-y-0 right-0 flex items-center pr-4 text-text-secondary`}
                            >
                              <RiCheckLine className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
                        </>
                      )}
                  </>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        )}
      </div>
    </Combobox >
  )
}

// 简单下拉框
const SimpleSelect: FC<ISelectProps> = ({
  className,
  wrapperClassName = '',
  renderTrigger,  // 自定义触发元素渲染函数
  items = defaultItems,
  defaultValue = 1,
  disabled = false,
  onSelect,
  placeholder,
  optionWrapClassName,
  optionClassName,
  hideChecked,
  notClearable,
  renderOption,
}) => {

  const localPlaceholder = placeholder || '请选择'

  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  useEffect(() => {
    let defaultSelect = null
    const existed = items.find((item: Item) => item.value === defaultValue)
    if (existed)
      defaultSelect = existed

    setSelectedItem(defaultSelect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])

  return (
    <Listbox
      value={selectedItem}
      onChange={(value: Item) => {
        if (!disabled) {
          setSelectedItem(value)
          onSelect(value)
        }
      }}
    >
      <div className={`group/simple-select relative h-9 ${wrapperClassName}`}>
        {renderTrigger && <ListboxButton className='w-full'>{renderTrigger(selectedItem)}</ListboxButton>}
        {!renderTrigger && (
          <ListboxButton className={`flex items-center w-full h-full rounded-lg border-0 bg-primary-50 pl-3 pr-10 sm:text-sm sm:leading-6 focus-visible:outline-none focus-visible:bg-primary-50 group-hover/simple-select:bg-primary-50 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${className}`}>
            <span className={`block truncate text-left text-sm font-normal text-text-tertiary ${!selectedItem?.name && 'text-text-primary'}`}>{selectedItem?.name ?? localPlaceholder}</span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-2">
              {(selectedItem && !notClearable)
                ? (
                  <RiCloseLine
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      setSelectedItem(null)
                      onSelect({ name: '', value: '' })
                    }}
                    className="h-4 w-4 cursor-pointer text-text-quaternary"
                    aria-hidden="false"
                  />
                )
                : (
                  <RiArrowDownSLine
                    className="h-4 w-4 text-text-quaternary group-hover/simple-select:text-text-secondary"
                    aria-hidden="true"
                  />
                )}
            </span>
          </ListboxButton>
        )}

        {!disabled && (
          <ListboxOptions className={`absolute z-10 mt-1 px-1 max-h-60 w-full overflow-auto rounded-xl bg-white backdrop-blur-sm py-1 text-base shadow-lg border-primary border-[0.5px] focus:outline-none sm:text-sm ${optionWrapClassName}`}>
            {items.map((item: Item) => (
              <ListboxOption
                key={item.value}
                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 rounded-lg hover:bg-primary-50 text-text-secondary ${optionClassName}`}
                value={item}
                disabled={disabled}
              >
                {({ /* active, */ selected }) => (
                  <>
                    {renderOption
                      ? renderOption({ item, selected })
                      : (<>
                        <span className={`block ${selected && 'font-normal'}`}>{item.name}</span>
                        {selected && !hideChecked && (
                          <span
                            className='absolute inset-y-0 right-0 flex items-center pr-4 text-text-tertiary'
                          >
                            <RiCheckLine className="h-4 w-4" aria-hidden="true" />
                          </span>
                        )}
                      </>)}
                  </>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        )}
      </div>
    </Listbox>
  )
}

export { SimpleSelect }
export default React.memo(Select)
