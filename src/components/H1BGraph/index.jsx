import React, { Component } from 'react';
import d3 from 'd3';

import Histogram from '../Histogram';
import Controls from './Controls';

require('./style.less');

class H1BGraph extends Component {
  constructor() {
    super();
    this.state = {
      rawData: [],
      dataFilter: () => true
    };
  }

  cleanJobs(title) {
    return "other";
  }

  componentWillMount() {
    this.loadRawData();
  }

  loadRawData() {
    let dateFormat = d3.time.format("%m/%d/%Y");

    d3.csv(this.props.url)
      .row((d) => {
        if (!d['base salary']) {
          return null;
        }

        return {employer: d.employer,
                submit_date: dateFormat.parse(d['submit date']),
                start_date: dateFormat.parse(d['start date']),
                case_status: d['case status'],
                job_title: d['job title'],
                clean_job_title: this.cleanJobs(d['job title']),
                base_salary: Number(d['base salary']),
                salary_to: d['salary to'] ? Number(d['salary to']) : null,
                city: d.city,
                state: d.state};
      })
      .get((error, rows) => {
        if (error) {
          console.error(error);
          console.error(error.stack);
        }else{
          this.setState({rawData: rows});
        }
      });
  }

  updateDataFilter(filter) {
    this.setState({dataFilter: filter});
  }

  render() {
    if (!this.state.rawData.length) {
      return (
        <h2>Loading H1B visa data..</h2>
      );
    }

    let params = {
      bins: 20,
      width: 500,
      height: 500,
      axisMargin: 83,
      topMargin: 10,
      bottomMargin: 5,
      value: (d) => d.base_salary},
        fullWidth = 700;

    let filteredData = this.state.rawData
                           .filter(this.state.dataFilter);
    return (
      <div>
        <svg width={fullWidth} height={params.height}>
          <Histogram {...params} data={filteredData} />
        </svg>
        <Controls data={this.state.rawData} updateDataFilter={::this.updateDataFilter} />
      </div>
    );
  }
}

export default H1BGraph;