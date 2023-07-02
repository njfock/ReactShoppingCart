import React, { useState, useEffect, useReducer } from "react";

import {
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
  }  from 'react-bootstrap'
import axios from 'axios'
// simulate getting products from DataBase
const products = [
    { name: "Apples_:", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
  ];
  
  const photos = ["/assets/img/apple.png", "/assets/img/orange.png", "./assets/img/beans.png", "./assets/img/cabbage.png"];
  const Products = (props) => {
    const [items, setItems] = useState(products);
    const [cart, setCart] = useState([]);

    
      //=========Cart=============
      const Cart = (props) => {
        let data = props.location.data ? props.location.data : products;
        console.log(`data:${JSON.stringify(data)}`);
      
        return <Accordion defaultActiveKey="0">{list}</Accordion>;
      };
      const addToCart = (e) => {
        let name = e.target.name;
        let item = items.filter((item) => item.name === name);
        console.log(`add to Cart ${JSON.stringify(item)}`);
        setCart([...cart, ...item]);
        //doFetch(query);
      };
      
      const useDataApi = (initialUrl, initialData) => {
        const [url, setUrl] = useState(initialUrl);
      
        const [state, dispatch] = useReducer(dataFetchReducer, {
          isLoading: false,
          isError: false,
          data: initialData,
        });

        
        console.log(`useDataApi called`);
        useEffect(() => {
          console.log("useEffect Called");
          let didCancel = false;
          const fetchData = async () => {
            dispatch({ type: "FETCH_INIT" });
            try {
              const result = await axios(url);
              console.log("FETCH FROM URl");
              if (!didCancel) {
                dispatch({ type: "FETCH_SUCCESS", payload: result.data });
              }
            } catch (error) {
              if (!didCancel) {
                dispatch({ type: "FETCH_FAILURE" });
              }
            }
          };
          fetchData();
          return () => {
            didCancel = true;
          };
        }, [url]);
        return [state, setUrl];
      };
      const dataFetchReducer = (state, action) => {
        switch (action.type) {
          case "FETCH_INIT":
            return {
              ...state,
              isLoading: true,
              isError: false,
            };
          case "FETCH_SUCCESS":
            return {
              ...state,
              isLoading: false,
              isError: false,
              data: action.payload,
            };
          case "FETCH_FAILURE":
            return {
              ...state,
              isLoading: false,
              isError: true,
            };
          default:
            throw new Error();
        }
      };
    let list = items.map((item, index) => {
        return (
          <li key={index}>
            <Image src={photos[index % 4]} width={70} roundedCircle></Image>
            <Button variant="primary" size="large">
              {item.name}:{item.cost}
            </Button>
            <input name={item.name} type="submit" onClick={addToCart}></input>
          </li>
        );
      });

    //  Fetch Data
    const [query, setQuery] = useState("api/products");
    const [{ data }, doFetch] = useDataApi(
      "http://localhost:1337/api/products",
      {
        data: [],
      }
    );
    console.log(`Rendering Products ${JSON.stringify(data.data)}`);
    
    const deleteCartItem = (index) => {
      let newCart = cart.filter((item, i) => index !== i);
      setCart(newCart);
    };
  
    
    let cartList = cart.map((item, index) => {
      return (
        <Accordion.Item key={1+index} eventKey={1 + index}>
        <Accordion.Header>
          {item.name}
        </Accordion.Header>
        <Accordion.Body onClick={() => deleteCartItem(index)}
          eventKey={1 + index}>
          $ {item.cost} from {item.country}
        </Accordion.Body>
      </Accordion.Item>
      );
    });
  
    let finalList = () => {
      let total = checkOut();
      let final = cart.map((item, index) => {
        return (
          <div key={index} index={index}>
            {item.name}
          </div>
        );
      });
      return { final, total };
    };
  
    const checkOut = () => {
      let costs = cart.map((item) => item.cost);
      const reducer = (accum, current) => accum + current;
      let newTotal = costs.reduce(reducer, 0);
      console.log(`total updated to ${newTotal}`);
      return newTotal;
    };
    // TODO: implement the restockProducts function
    const restockProducts = (url) => {
      console.log('restockProducts url', url)
      doFetch(url);
      let newItems = data.data.map((item) => {
        console.log('item', item)
        let { attributes } = item;
        let { name, country, cost, instock } = attributes;
        return { name, country, cost, instock };
      });
      console.log('newItems', newItems)
      setItems([...items, ...newItems]);
    };
  
    return (
      <Container>
        <Row>
          <Col>
            <h1>Product List</h1>
            <ul style={{ listStyleType: "none" }}>{list}</ul>
          </Col>
          <Col>
            <h1>Cart Contents</h1>
            <Accordion defaultActiveKey="0">{cartList}</Accordion>
          </Col>
          <Col>
            <h1>CheckOut </h1>
            <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
            <div> {finalList().total > 0 && finalList().final} </div>
          </Col>
        </Row>
        <Row>
          <form
            onSubmit={(event) => {
              restockProducts(`http://localhost:1337/${query}`);
              console.log(`Restock called on ${query}`);
              event.preventDefault();
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit">ReStock Products</button>
          </form>
        </Row>
      </Container>
    );
  };

  export default Products;