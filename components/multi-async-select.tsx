"use client";

import * as React from "react";
import { useMemo } from "react";
import { ChevronDown, XIcon, CheckIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Option {
  label: string;
  value: string; // should be unique, and not empty
}

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * An array of objects to be displayed in the Select.Option.
   */
  options: Option[];

  /**
   * Whether the select is async. If true, the getting options should be async.
   * Optional, defaults to false.
   */
  async?: boolean;

  /**
   * Whether is fetching options. If true, the loading indicator will be shown.
   * Optional, defaults to false. Works only when async is true.
   */
  loading?: boolean;

  /**
   * The error object. If true, the error message will be shown.
   * Optional, defaults to null. Works only when async is true.
   */
  error?: Error | null;

  /** The controlled selected values. */
  value?: string[];

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Placeholder text to be displayed when the search input is empty.
   * Optional, defaults to "Search...".
   */
  searchPlaceholder?: string;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;

  /**
   * Text to be displayed when the clear button is clicked.
   * Optional, defaults to "Clear".
   */
  clearText?: string;

  /**
   * Text to be displayed when the close button is clicked.
   * Optional, defaults to "Close".
   */
  closeText?: string;

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /**
   * Callback function triggered when the search input changes.
   * Receives the search input value.
   */
  onSearch?: (value: string) => void;
}

export const MultiAsyncSelect = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      options,
      onValueChange,
      onSearch,
      value,
      defaultValue = [],
      placeholder = "Seleccionar opciones...",
      searchPlaceholder = "Buscar...",
      clearText = "Limpiar",
      closeText = "Cerrar",
      maxCount = Number.MAX_SAFE_INTEGER,
      modalPopover = false,
      className,
      loading = false,
      async = false,
      error = null,
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(value || defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    // Use controlled value if provided, otherwise use internal state
    const currentValues = value !== undefined ? value : selectedValues;

    // Use useMemo to compute optionsRef instead of useEffect
    const optionsRef = useMemo(() => {
      const temp = options.reduce((acc, option) => {
        acc[option.value] = option;
        return acc;
      }, {} as Record<string, Option>);
      
      if (async) {
        const temp2 = currentValues.reduce((acc, value) => {
          const option = temp[value];
          if (option) {
            acc[option.value] = option;
          }
          return acc;
        }, {} as Record<string, Option>);
        
        return {
          ...temp,
          ...temp2,
        };
      }
      
      return temp;
    }, [async, options, currentValues]);

    const toggleOption = (option: string) => {
      const isAddon = currentValues.includes(option);
      const newSelectedValues = isAddon
        ? currentValues.filter((value) => value !== option)
        : [...currentValues, option];
      
      // Only update internal state if not controlled
      if (value === undefined) {
        setSelectedValues(newSelectedValues);
      }
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      const newSelectedValues: string[] = [];
      // Only update internal state if not controlled
      if (value === undefined) {
        setSelectedValues(newSelectedValues);
      }
      onValueChange(newSelectedValues);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = currentValues.slice(0, maxCount);
      // Only update internal state if not controlled
      if (value === undefined) {
        setSelectedValues(newSelectedValues);
      }
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (currentValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        // Only update internal state if not controlled
        if (value === undefined) {
          setSelectedValues(allValues);
        }
        onValueChange(allValues);
      }
    };

    console.log(currentValues)

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger
          render={
            <Button
              ref={ref}
              {...props}
              onClick={handleTogglePopover}
              className={cn(
                "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white hover:bg-transparent focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 dark:border-zinc-800 dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 dark:bg-black dark:hover:bg-black [&_svg]:pointer-events-auto",
                className
              )}
            />
          }
        >
          {currentValues.length > 0 ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
                {currentValues.slice(0, maxCount).map((value) => {
                  let option: Option | undefined;
                  if (async) {
                    option = optionsRef[value];
                  } else {
                    option = options.find((option) => option.value === value);
                  }
                  return (
                    <Badge key={value} className="capitalize">
                      <span>{option?.label}</span>
                      <div
                        className="ml-2 size-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleOption(value);
                        }}
                      >
                        <XIcon />
                      </div>
                    </Badge>
                  );
                })}
                {currentValues.length > maxCount && (
                  <Badge>
                    <span>{`+ ${currentValues.length - maxCount}`}</span>

                    <div
                      className="ml-2 size-4 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearExtraOptions();
                      }}
                    >
                      <XIcon />
                    </div>
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <XIcon
                  className="h-4 cursor-pointer text-zinc-500"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleClear();
                  }}
                />
                <Separator
                  orientation="vertical"
                  className="flex min-h-6 h-full mx-2"
                />
                <ChevronDown className="h-4 cursor-pointer text-zinc-300 dark:text-zinc-500" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full mx-auto">
              <span className="text-sm font-normal text-zinc-500">
                {placeholder}
              </span>
              <ChevronDown className="h-4 cursor-pointer text-zinc-300 dark:text-zinc-500" />
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="start"
        >
          <Command shouldFilter={!async}>
            <CommandInput
              placeholder={searchPlaceholder}
              onValueChange={(value) => {
                if (onSearch) {
                  onSearch(value);
                }
              }}
            />
            <CommandList>
              {async && error && (
                <div className="p-4 text-destructive text-center">
                  {error.message}
                </div>
              )}
              {async && loading && options.length === 0 && (
                <div className="flex justify-center py-6 items-center h-full">
                  <Loader2 className="animate-spin" />
                </div>
              )}
              {async ? (
                !loading &&
                !error &&
                options.length === 0 && (
                  <div className="pt-6 pb-4 text-center text-sm">
                    Sin resultados
                  </div>
                )
              ) : (
                <CommandEmpty>
                  Sin resultados
                </CommandEmpty>
              )}
              <CommandGroup>
                {!async && (
                  <CommandItem
                    key="all"
                    onSelect={toggleAll}
                    className="cursor-pointer"
                  >
                    <div
                      className={cn(
                        "mr-1 size-4 text-center rounded-[4px] border border-primary shadow-xs transition-shadow outline-none",
                        currentValues.length === options.length
                          ? "bg-primary text-primary-foreground border-primary"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="size-3.5 text-white dark:text-black" />
                    </div>
                    <span>Seleccionar todo</span>
                  </CommandItem>
                )}
                {options.map((option) => {
                  const isSelected = currentValues.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                      className="cursor-pointer capitalize"
                    >
                      <div
                        className={cn(
                          "mr-1 size-4 text-center rounded-[4px] border border-primary shadow-xs transition-shadow outline-none",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="size-3.5 text-white dark:text-black" />
                      </div>
                      <span>{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiAsyncSelect.displayName = "MultiAsyncSelect";
