import { CSSProperties, MouseEvent, useEffect, useRef, useState } from "react";
import { Placeholder } from "../../types";
import "./styles.scss";
import caretDown from "../../assets/images/caret-down.svg";
import Scrollbars from "react-custom-scrollbars";
import { CSSTransition } from "react-transition-group";

type SelectSize = "large" | "small";

export interface OptionProps {
  id: string;
  label: JSX.Element | string;
  value: string;
}

export interface SelectProps {
  value?: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  placeholder?: Placeholder;
  style?: CSSProperties;
  className?: string;
  dropdownClassName?: string;
  size?: SelectSize;
  dropdownHeight?: number;
  options: OptionProps[];
  isMultiple?: boolean;
}

const Select = ({
  value,
  style,
  className,
  dropdownClassName,
  size = "large",
  dropdownHeight = 200,
  onChange,
  placeholder = "",
  options: optionsList = [],
  isMultiple = false,
}: SelectProps) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  /*for some reasons selectedValues' value was always [] in the map callback, that's
   * why we used the ref value to keep track of it*/
  const selectedValuesRef = useRef<string[]>([]);
  const selectedItemsJSX = useRef<(JSX.Element | string | null)[]>([]);
  const [isDropdownVisible, setDropdownVisibility] = useState(false);
  /* this is the list of items that are shown in the selection drop down */
  const [selectOptionsJSX, setSelectOptionsJSX] = useState<JSX.Element[]>([]);

  /*this is the wrapper that will wrap every selected item and append them in the select field*/
  const wrapSelectedItem = (option: OptionProps) => {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setDropdownVisibility(false);
          deselectAnOption(option);
        }}
        key={option.value}
        className={"dw-single-selection"}
      >
        {option.label}
      </div>
    );
  };

  useEffect(() => {
    if (!value) {
      return;
    }
    let selectedValuesArray = Array.isArray(value) ? value : [value];
    /* if it is not multiple but the user has given more than one selected option, simply just use the first item */
    selectedValuesArray = isMultiple
      ? selectedValuesArray
      : selectedValuesArray && selectedValuesArray.length > 0
      ? [selectedValuesArray[0]]
      : selectedValuesArray;
    selectedItemsJSX.current = selectedValuesArray.map((value) => {
      const item = optionsList.find((option) => option.value === value);
      if (!item) {
        return null;
      }
      if (!isMultiple) {
        return <div key={item.value}>{item.label}</div>;
      }
      return wrapSelectedItem(item);
    });

    selectedValuesRef.current = selectedValuesArray;
    setSelectedValues(selectedValuesRef.current);
  }, []);

  const deselectAnOption = (option: OptionProps) => {
    const index = selectedValuesRef.current.findIndex((value) => value === option.value);
    selectedValuesRef.current.splice(index, 1);

    selectedItemsJSX.current.splice(index, 1);
    // this will trigger the component re-render
    setSelectedValues([...selectedValuesRef.current]);
    onChange([...selectedValuesRef.current]);
  };

  const onOptionClick = (option: OptionProps) => {
    if (isMultiple) {
      // deselect an item if it was already selected

      const isItemAlreadySelected = selectedValuesRef.current.includes(option.value);

      if (isItemAlreadySelected) {
        //deselect it
        const index = selectedValuesRef.current.findIndex((value) => value === option.value);
        selectedValuesRef.current.splice(index, 1);

        selectedItemsJSX.current.splice(index, 1);
      } else {
        //select it
        selectedValuesRef.current = [...selectedValuesRef.current, option.value];
        selectedItemsJSX.current = [...selectedItemsJSX.current, wrapSelectedItem(option)];
      }

      // this will trigger the component re-render
      setSelectedValues([...selectedValuesRef.current]);
      onChange([...selectedValuesRef.current]);
    } else {
      /* don't wrap single selections JSX */
      selectedItemsJSX.current = [option.label];
      selectedValuesRef.current = [option.value];
      setSelectedValues([...selectedValuesRef.current]);
      setDropdownVisibility(false);
      onChange(option.value);
    }
  };

  /* This will show be called every time the user selects the option and add the
   * selected highlight class if necessary (in case of multiple selections) */
  useEffect(() => {
    const someOptions = optionsList.map((item) => {
      const selectedOption = isMultiple
        ? selectedValuesRef.current.includes(item.value)
          ? "dw-multiple-selected-option"
          : ""
        : selectedValuesRef.current.includes(item.value)
        ? "dw-selected-option"
        : "";

      return (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onOptionClick(item);
          }}
          key={item.id}
          className={`dw-option ${size} ${selectedOption}`}
        >
          {item.label}
        </div>
      );
    });
    setSelectOptionsJSX(someOptions);
  }, [optionsList, selectedValues]);

  const onDropdownClicked = () => {
    // e.stopPropagation();
    setDropdownVisibility((isVisible) => !isVisible);
  };

  const onDropdownBlurred = () => {
    setDropdownVisibility(false);
  };

  const multiSelectionsClass = isMultiple ? "dw-multi-selections" : "";

  return (
    <div tabIndex={0} onBlur={onDropdownBlurred} className={`dw-select-wrapper ${size}`}>
      <div
        onClick={() => {
          onDropdownClicked();
        }}
        style={{ ...style }}
        className={`dw-select ${className}`}
      >
        <div className={`dw-selected-value ${multiSelectionsClass}`}>
          {selectedItemsJSX.current && selectedItemsJSX.current.length > 0 ? (
            selectedItemsJSX.current
          ) : (
            <div className={"placeholder"}>{placeholder}</div>
          )}
        </div>
        <img src={caretDown} alt="image" />
      </div>
      <CSSTransition unmountOnExit={true} in={isDropdownVisible} timeout={300} classNames={"dw-drop-down"}>
        <Scrollbars
          autoHeight={true}
          autoHeightMax={dropdownHeight}
          className={`dw-select-options-wrapper ${dropdownClassName}`}
        >
          <div className={"dw-select-options"}>{selectOptionsJSX}</div>
        </Scrollbars>
      </CSSTransition>
    </div>
  );
};

export default Select;
