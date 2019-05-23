// @flow
import React, { Component } from 'react';
import Test from '../components/TestComponent'

type Props = {};

export default class HomePage extends Component<Props> {
  props: Props;

  render() {
    return <Test />;
  }
}