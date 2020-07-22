import React from 'react';
import { Menu, Container } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

export default function main () {
  return (
    <Menu>
      <Container>
        <Menu.Item as={Link} to='/'>Home</Menu.Item>
        <Menu.Item as={Link} to='/demo' active>Demo</Menu.Item>
        <Menu.Item href="https://substrate.io">Substrate</Menu.Item>
        <Menu.Item href="https://parity.io">Parity</Menu.Item>
      </Container>
    </Menu>
  );
}
