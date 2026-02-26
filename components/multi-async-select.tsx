"use client";

import { CheckIcon, ChevronDown, Loader2, XIcon } from "lucide-react";
import {
  type ButtonHTMLAttributes,
  forwardRef,
  useMemo,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string; // should be unique, and not empty
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
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

export const MultiAsyncSelect = forwardRef<HTMLButtonElement, Props>(
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
    const [selectedValues, setSelectedValues] = useState<string[]>(
      value || defaultValue
    );
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Use controlled value if provided, otherwise use internal state
    const currentValues = value !== undefined ? value : selectedValues;

    // Use useMemo to compute optionsRef instead of useEffect
    const optionsRef = useMemo(() => {
      const temp = options.reduce(
        (acc, option) => {
          acc[option.value] = option;
          return acc;
        },
        {} as Record<string, Option>
      );

      if (async) {
        const temp2 = currentValues.reduce(
          (acc, value) => {
            const option = temp[value];
            if (option) {
              acc[option.value] = option;
            }
            return acc;
          },
          {} as Record<string, Option>
        );

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

    return (
      <Popover
        modal={modalPopover}
        onOpenChange={setIsPopoverOpen}
        open={isPopoverOpen}
      >
        <PopoverTrigger
          render={
            <Button
              ref={ref}
              {...props}
              className={cn(
                "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-white hover:bg-transparent focus:outline-none focus:ring-1 focus:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:ring-offset-zinc-950 dark:focus:ring-zinc-300 dark:hover:bg-black [&>span]:line-clamp-1 [&_svg]:pointer-events-auto",
                className
              )}
              onClick={handleTogglePopover}
            />
          }
        >
          {currentValues.length > 0 ? (
            <div className="flex w-full items-center justify-between">
              <div className="flex flex-nowrap items-center gap-1 overflow-x-auto">
                {currentValues.slice(0, maxCount).map((value) => {
                  let option: Option | undefined;
                  if (async) {
                    option = optionsRef[value];
                  } else {
                    option = options.find((option) => option.value === value);
                  }
                  return (
                    <Badge className="capitalize" key={value}>
                      <span>{option?.label}</span>
                      {/* biome-ignore lint/a11y/useSemanticElements: can't use <button> inside PopoverTrigger <button> */}
                      <span
                        className="ml-2 size-4 cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleOption(value);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.stopPropagation();
                            toggleOption(value);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <XIcon />
                      </span>
                    </Badge>
                  );
                })}
                {currentValues.length > maxCount && (
                  <Badge>
                    <span>{`+ ${currentValues.length - maxCount}`}</span>
                    {/* biome-ignore lint/a11y/useSemanticElements: can't use <button> inside PopoverTrigger <button> */}
                    <span
                      className="ml-2 size-4 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation();
                        clearExtraOptions();
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.stopPropagation();
                          clearExtraOptions();
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <XIcon />
                    </span>
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
                  className="mx-2 flex h-full min-h-6"
                  orientation="vertical"
                />
                <ChevronDown className="h-4 cursor-pointer text-zinc-300 dark:text-zinc-500" />
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full items-center justify-between">
              <span className="font-normal text-sm text-zinc-500">
                {placeholder}
              </span>
              <ChevronDown className="h-4 cursor-pointer text-zinc-300 dark:text-zinc-500" />
            </div>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Command shouldFilter={!async}>
            <CommandInput
              onValueChange={(value) => {
                if (onSearch) {
                  onSearch(value);
                }
              }}
              placeholder={searchPlaceholder}
            />
            <CommandList>
              {async && error && (
                <div className="p-4 text-center text-destructive">
                  {error.message}
                </div>
              )}
              {async && loading && options.length === 0 && (
                <div className="flex h-full items-center justify-center py-6">
                  <Loader2 className="animate-spin" />
                </div>
              )}
              {async ? (
                !(loading || error) &&
                options.length === 0 && (
                  <div className="pt-6 pb-4 text-center text-sm">
                    Sin resultados
                  </div>
                )
              ) : (
                <CommandEmpty>Sin resultados</CommandEmpty>
              )}
              <CommandGroup>
                {!async && (
                  <CommandItem
                    className="cursor-pointer"
                    key="all"
                    onSelect={toggleAll}
                  >
                    <div
                      className={cn(
                        "mr-1 size-4 rounded-[4px] border border-primary text-center shadow-xs outline-none transition-shadow",
                        currentValues.length === options.length
                          ? "border-primary bg-primary text-primary-foreground"
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
                      className="cursor-pointer capitalize"
                      key={option.value}
                      onSelect={() => toggleOption(option.value)}
                    >
                      <div
                        className={cn(
                          "mr-1 size-4 rounded-[4px] border border-primary text-center shadow-xs outline-none transition-shadow",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
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
