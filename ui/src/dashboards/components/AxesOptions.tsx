// Libraries
import React, {PureComponent, MouseEvent} from 'react'
import {connect} from 'react-redux'

// Components
import OptIn from 'src/shared/components/OptIn'
import Input from 'src/dashboards/components/DisplayOptionsInput'
import {Tabber, Tab} from 'src/dashboards/components/Tabber'
import {Radio, ButtonShape} from 'src/reusable_ui'
import FancyScrollbar from 'src/shared/components/FancyScrollbar'
import LineGraphColorSelector from 'src/shared/components/LineGraphColorSelector'
import GraphOptionsDecimalPlaces from 'src/dashboards/components/GraphOptionsDecimalPlaces'

// Constants
import {
  AXES_SCALE_OPTIONS,
  TOOLTIP_Y_VALUE_FORMAT,
} from 'src/dashboards/constants/cellEditor'
import {GRAPH_TYPES} from 'src/dashboards/graphics/graph'

// Actions
import {
  updateAxes,
  changeDecimalPlaces,
} from 'src/dashboards/actions/cellEditorOverlay'

// Decorators
import {ErrorHandling} from 'src/shared/decorators/errors'

// Types
import {Axes, CellType} from 'src/types'
import {DecimalPlaces} from 'src/types/dashboards'

const {LINEAR, LOG, BASE_2, BASE_10} = AXES_SCALE_OPTIONS
const getInputMin = scale => (scale === LOG ? '0' : null)

interface Props {
  type: string
  axes: Axes
  staticLegend: boolean
  defaultYLabel: string
  onUpdateDecimalPlaces: () => void
  decimalPlaces: DecimalPlaces
  handleUpdateAxes: (axes: Axes) => void
  onToggleStaticLegend: (x: boolean) => (e: MouseEvent<HTMLLIElement>) => void
}

@ErrorHandling
class AxesOptions extends PureComponent<Props> {
  public static defaultProps: Partial<Props> = {
    axes: {
      y: {
        bounds: ['', ''],
        prefix: '',
        suffix: '',
        base: BASE_10,
        scale: LINEAR,
        label: '',
      },
      x: {
        bounds: ['', ''],
        prefix: '',
        suffix: '',
        base: BASE_10,
        scale: LINEAR,
        label: '',
      },
    },
  }

  public render() {
    const {
      axes: {
        y: {bounds, label, prefix, suffix, base, scale},
      },
      type,
      staticLegend,
      defaultYLabel,
      onToggleStaticLegend,
    } = this.props

    const [min, max] = bounds

    const {menuOption} = GRAPH_TYPES.find(graph => graph.type === type)

    return (
      <FancyScrollbar
        className="display-options--cell y-axis-controls"
        autoHide={false}
      >
        <div className="display-options--cell-wrapper">
          <h5 className="display-options--header">{menuOption} Controls</h5>
          <form autoComplete="off" className="form-group-wrapper">
            <div className="form-group col-sm-12">
              <label htmlFor="prefix">Title</label>
              <OptIn
                type="text"
                customValue={label}
                onSetValue={this.handleSetLabel}
                customPlaceholder={defaultYLabel || 'y-axis title'}
              />
            </div>
            <LineGraphColorSelector />
            <div className="form-group col-sm-6">
              <label htmlFor="min">Min</label>
              <OptIn
                customPlaceholder={'min'}
                customValue={min}
                onSetValue={this.handleSetYAxisBoundMin}
                type="number"
                min={getInputMin(scale)}
              />
            </div>
            <div className="form-group col-sm-6">
              <label htmlFor="max">Max</label>
              <OptIn
                customPlaceholder="max"
                customValue={max}
                onSetValue={this.handleSetYAxisBoundMax}
                type="number"
                min={getInputMin(scale)}
              />
            </div>
            <Input
              name="prefix"
              id="prefix"
              value={prefix}
              labelText="Y-Value's Prefix"
              onChange={this.handleSetPrefixSuffix}
            />
            <Input
              name="suffix"
              id="suffix"
              value={suffix}
              labelText="Y-Value's Suffix"
              onChange={this.handleSetPrefixSuffix}
            />
            <div className="form-group col-sm-6">
              <label>Y-Value's Format</label>
              {this.yValuesFormatTabs}
            </div>
            <Tabber labelText="Scale">
              <Tab
                text="Linear"
                isActive={scale === LINEAR || scale === ''}
                onClickTab={this.handleSetScale(LINEAR)}
              />
              <Tab
                text="Logarithmic"
                isActive={scale === LOG}
                onClickTab={this.handleSetScale(LOG)}
              />
            </Tabber>
            {this.decimalPlaces}
            <Tabber labelText="Static Legend">
              <Tab
                text="Show"
                isActive={staticLegend}
                onClickTab={onToggleStaticLegend(true)}
              />
              <Tab
                text="Hide"
                isActive={!staticLegend}
                onClickTab={onToggleStaticLegend(false)}
              />
            </Tabber>
          </form>
        </div>
      </FancyScrollbar>
    )
  }

  private get yValuesFormatTabs(): JSX.Element {
    const {
      axes: {
        y: {base},
      },
    } = this.props

    return (
      <Radio shape={ButtonShape.StretchToFit}>
        <Radio.Button
          id="y-values-format-tab--raw"
          value=""
          active={base === ''}
          titleText="Don't format values"
          onClick={this.handleSetBase}
        >
          Raw
        </Radio.Button>
        <Radio.Button
          id="y-values-format-tab--kmb"
          value={BASE_10}
          active={base === BASE_10}
          titleText="Thousand / Million / Billion"
          onClick={this.handleSetBase}
        >
          K/M/B
        </Radio.Button>
        <Radio.Button
          id="y-values-format-tab--kmg"
          value={BASE_2}
          active={base === BASE_2}
          titleText="Kilo / Mega / Giga"
          onClick={this.handleSetBase}
        >
          K/M/G
        </Radio.Button>
      </Radio>
    )
  }

  private get decimalPlaces(): JSX.Element {
    const {onUpdateDecimalPlaces, decimalPlaces, type} = this.props

    if (type !== CellType.LinePlusSingleStat) {
      return null
    }

    return (
      <GraphOptionsDecimalPlaces
        digits={decimalPlaces.digits}
        isEnforced={decimalPlaces.isEnforced}
        onDecimalPlacesChange={onUpdateDecimalPlaces}
      />
    )
  }

  private handleSetPrefixSuffix = e => {
    const {handleUpdateAxes, axes} = this.props
    const {prefix, suffix} = e.target.form

    const newAxes = {
      ...axes,
      y: {
        ...axes.y,
        prefix: prefix.value,
        suffix: suffix.value,
      },
    }

    handleUpdateAxes(newAxes)
  }

  private handleSetYAxisBoundMin = (min: string): void => {
    const {handleUpdateAxes, axes} = this.props
    const {
      y: {
        bounds: [, max],
      },
    } = this.props.axes

    const bounds: [string, string] = [min, max]
    const newAxes = {...axes, y: {...axes.y, bounds}}

    handleUpdateAxes(newAxes)
  }

  private handleSetYAxisBoundMax = (max: string): void => {
    const {handleUpdateAxes, axes} = this.props
    const {
      y: {
        bounds: [min],
      },
    } = axes

    const bounds: [string, string] = [min, max]
    const newAxes = {...axes, y: {...axes.y, bounds}}

    handleUpdateAxes(newAxes)
  }

  private handleSetLabel = label => {
    const {handleUpdateAxes, axes} = this.props
    const newAxes = {...axes, y: {...axes.y, label}}

    handleUpdateAxes(newAxes)
  }

  private handleSetScale = scale => () => {
    const {handleUpdateAxes, axes} = this.props
    const newAxes = {...axes, y: {...axes.y, scale}}

    handleUpdateAxes(newAxes)
  }

  private handleSetBase = (base: string): void => {
    const {handleUpdateAxes, axes} = this.props
    const newAxes = {...axes, y: {...axes.y, base}}

    console.log('thag')

    handleUpdateAxes(newAxes)
  }
}

const mstp = ({
  cellEditorOverlay: {
    cell: {axes, type},
  },
}) => ({
  axes,
  type,
})

const mdtp = {
  handleUpdateAxes: updateAxes,
  onUpdateDecimalPlaces: changeDecimalPlaces,
}

export default connect(mstp, mdtp)(AxesOptions)
