import React, { Component } from "react";
import { Switch, Route, Link, BrowserRouter as Router } from "react-router-dom";

import Cart from './components/Cart';
import Login from './components/Login';
import ProductList from './components/ProductList';
import About from './components/About';
import Home from './components/Home';
import axios from 'axios';
import jwt_decode from 'jwt-decode';

import Context from "./Context";


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      cart: {},
      products: []
    };
    this.routerRef = React.createRef();
  }

  async componentDidMount() {
    let user = localStorage.getItem("user");
    let cart = localStorage.getItem("cart");

    const products = await axios.get('http://localhost:3001/products');
    user = user ? JSON.parse(user) : null;
    cart = cart? JSON.parse(cart) : {};

    this.setState({ user,  products: products.data, cart });
  }

  login = async (email, password) => {
    const res = await axios.post(
      'http://localhost:3001/login',
      { email, password },
    ).catch((res) => {
      return { status: 401, message: 'Unauthorized' }
    })
  
    if(res.status === 200) {
      const { email } = jwt_decode(res.data.accessToken)
      const user = {
        email,
        token: res.data.accessToken,
        accessLevel: email === 'admin@example.com' ? 0 : 1
      }
  
      this.setState({ user });
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } else {
      return false;
    }
  }

  logout = e => {
    e.preventDefault();
    this.setState({ user: null });
    localStorage.removeItem("user");
  };
  
  addToCart = cartItem => {
    let cart = this.state.cart;
    if (cart[cartItem.id]) {
      cart[cartItem.id].amount += cartItem.amount;
    } else {
      cart[cartItem.id] = cartItem;
    }
    if (cart[cartItem.id].amount > cart[cartItem.id].product.stock) {
      cart[cartItem.id].amount = cart[cartItem.id].product.stock;
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };
  
  removeFromCart = cartItemId => {
    let cart = this.state.cart;
    delete cart[cartItemId];
    localStorage.setItem("cart", JSON.stringify(cart));
    this.setState({ cart });
  };
  
  clearCart = () => {
    let cart = {};
    localStorage.removeItem("cart");
    this.setState({ cart });
  };
  
  checkout = () => {
    if (!this.state.user) {
      this.routerRef.current.history.push("/login");
      return;
    }

    const cart = this.state.cart;
    const keranjang = this.state.products.map(p => {
      if (cart[p.name]) {
        p.amount= cart[p.name].amount;
       
        axios.post(
          `http://localhost:3002/products`,
          { ...p },
        )
      }
      return p;
    });

    const products = this.state.products.map(p => {
      if (cart[p.name]) {
        p.stock = p.stock - cart[p.name].amount;
        
        axios.put(
          `http://localhost:3001/products/${p.id}`,
          { ...p },
        )

      }
      return p;
    });

    this.setState({ products });
    this.setState({ keranjang });
    this.clearCart();
  };  
  

  render() {
    return (
      <Context.Provider
        value={{
          ...this.state,
          removeFromCart: this.removeFromCart,
          addToCart: this.addToCart,
          login: this.login,
          clearCart: this.clearCart,
          checkout: this.checkout
        }}
      >
        <Router ref={this.routerRef}>
        <div className="App">
          <nav
            className="navbar container"
            role="navigation"
            aria-label="main navigation"
          >
            <div className={`navbar-brand${
                    this.state.showMenu ? "is-active" : ""
                  }`}>
              <b  >
                <Link to="/" className="navbar-item is-size-4 ">ecommerce</Link>
              </b>
              <label
                role="button"
                class="navbar-burger burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarBasicExample"
                onClick={e => {
                  e.preventDefault();
                  this.setState({ showMenu: !this.state.showMenu });
                }}
              >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </label>
            </div>
              <div className={`navbar-menu ${
                    this.state.showMenu ? "is-active" : ""
                  }`}>
                  <Link to="/about" className="navbar-item">
                    About
                  </Link>
                  <Link to="/products" className="navbar-item">
                    Products
                  </Link>
                  <Link to="/cart" className="navbar-item">
                    Cart
                    <span
                      className="tag is-primary"
                      style={{ marginLeft: "5px" }}
                    >
                      { Object.keys(this.state.cart).length }
                    </span>
                  </Link>
                  {!this.state.user ? (
                    <Link to="/login" className="navbar-item">
                      Login
                    </Link>
                  ) : (
                    <Link to="/" onClick={this.logout} className="navbar-item">
                      Logout
                    </Link>
                  )}
              </div>
          </nav>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/about" component={About} />
              <Route exact path="/productlist" component={ProductList} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/cart" component={Cart} />
              <Route exact path="/products" component={ProductList} />
            </Switch>
          </div>
        </Router>
      </Context.Provider>
    );
  }
}