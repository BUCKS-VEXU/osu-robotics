/* Noah Klein */

import { useState, useEffect } from 'react';
import ReactSlider from "react-slider";

import "./Slider.css";

interface SliderProps {
  value: number;
  setValue: any;
  min: number;
  max: number;
  scaleFunction: (x: number) => number;
  inverseScaleFunction: (x: number) => number;
}

const Slider = ({ value, min, max, scaleFunction, setValue, inverseScaleFunction }: SliderProps) => {
  const [sliderValue, setSliderValue] = useState<number>(min);

  useEffect(() => {
    setSliderValue(inverseScaleFunction(value));
    // eslint-disable-next-line
  }, [value]);


  const onSliderChange = (e: any) => {
    setSliderValue(e);
    setValue(scaleFunction(e));
  }

  const onTickerChange = (e: any) => {
    let clampedValue = Math.min(max, Math.max(min, Number(e.target.value)));
    setSliderValue(inverseScaleFunction(clampedValue));
    setValue(clampedValue);
  }

  return (
    <>
      <input
        type="number"
        className="number-input"
        value={Math.round((value + Number.EPSILON) * 100) / 100}
        onChange={(e) => { onTickerChange(e); }}
      />
      <ReactSlider
        className="customSlider"
        onChange={onSliderChange}
        trackClassName="customSlider-track"
        thumbClassName="customSlider-thumb"
        value={sliderValue}
        min={inverseScaleFunction(min)}
        max={inverseScaleFunction(max)}
        orientation="horizontal"
      />
    </>
  );
};

export default Slider;
