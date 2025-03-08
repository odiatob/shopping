import React, { createContext, useContext, useState } from 'react';
import { SafeAreaView, FlatList, View, Alert, StyleSheet, Text, Image } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';

// Define color palette
const COLORS = {
  primary: '#4caf50', // Friendly Green
  secondary: '#f8a5c2', // Soft Pink
  accent: '#f1c40f', // Gentle Yellow
  background: '#f5f5f5', // Off-white background
  text: '#34495e', // Dark Gray for text
};

// Define font (using Expo's built-in fonts)
const FONT_FAMILY = 'Poppins_400Regular'; // Built-in Poppins font from Expo

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string; // Image URL for each product
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CartProvider: React.FC = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: CartItem) => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      existingProduct.quantity += 1;
      setCart([...cart]);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    const product = cart.find(item => item.id === id);
    if (product) {
      product.quantity = quantity;
      setCart([...cart]);
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// HomeScreen
const products = [
  { id: '1', name: 'Hotdog Sparkling Water', price: 5, imageUrl: require('./assets/bigbite.png') },
  { id: '2', name: 'Meatball Gum', price: 10, imageUrl: require('./assets/meatball.png') },
  { id: '3', name: 'Sour Patch', price: 10, imageUrl: require('./assets/sourpatch.png') },
];

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (item: CartItem) => {
    addToCart(item);
    Alert.alert('Item Added', `${item.name} has been added to your cart.`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <Card.Content style={styles.productCardContent}>
              {/* Product Image */}
              <Image
                source={item.imageUrl} // Ensure the image URL is correct here
                style={styles.productImage}
                resizeMode="cover" // Make image cover the available space
              />
              {/* Product Name */}
              <Title style={[styles.productTitle, { color: COLORS.text }]}>{item.name}</Title>
              {/* Product Price */}
              <Paragraph style={[styles.productPrice, { color: COLORS.text }]}>${item.price}</Paragraph>
              {/* Add to Cart Button */}
              <Button
                mode="contained"
                onPress={() => handleAddToCart(item)}
                style={[styles.addToCartButton, { backgroundColor: COLORS.primary }]}
              >
                Add to Cart
              </Button>
            </Card.Content>
          </Card>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productList}
      />
      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Cart')}
        style={[styles.cartButton, { borderColor: COLORS.secondary, color: COLORS.secondary }]}
      >
        Go to Cart
      </Button>
    </SafeAreaView>
  );
};


// CartScreen
const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cart, removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (id: string, action: 'increase' | 'decrease') => {
    const product = cart.find(item => item.id === id);
    if (product) {
      const newQuantity = action === 'increase' ? product.quantity + 1 : product.quantity - 1;
      updateQuantity(id, newQuantity > 0 ? newQuantity : 1);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <FlatList
        data={cart}
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <Card.Content>
              <Image
                source={item.imageUrl}
                style={styles.productImage}
              />
              <Title style={[styles.productTitle, { color: COLORS.text }]}>{item.name}</Title>
              <Paragraph style={[styles.productPrice, { color: COLORS.text }]}>${item.price} x {item.quantity}</Paragraph>
              <View style={styles.quantityControl}>
                <Button
                  mode="outlined"
                  onPress={() => handleQuantityChange(item.id, 'decrease')}
                  style={{ borderColor: COLORS.primary }}
                >
                  -
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleQuantityChange(item.id, 'increase')}
                  style={{ borderColor: COLORS.primary }}
                >
                  +
                </Button>
                <Button
                  mode="text"
                  onPress={() => removeFromCart(item.id)}
                  style={[styles.removeButton, { color: COLORS.accent }]}
                >
                  Remove
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.cartList}
      />
      <Button
        mode="contained"
        onPress={() => navigation.navigate('Checkout')}
        style={[styles.checkoutButton, { backgroundColor: COLORS.primary }]}
      >
        Go to Checkout
      </Button>
    </SafeAreaView>
  );
};

// CheckoutScreen
const CheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { cart, clearCart } = useCart();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    Alert.alert('Checkout successful', '', [
      {
        text: 'OK',
        onPress: () => {
          clearCart();
          navigation.navigate('Home');
        },
      },
    ]);
  };

  // If the cart is empty, display a message
  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <Text style={[styles.title, { color: COLORS.text }]}>Checkout</Text>
        <Text style={[styles.emptyCartMessage, { color: COLORS.accent }]}>
          Your cart is empty. Add items to checkout.
        </Text>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Home')}
          style={[styles.cartButton, { borderColor: COLORS.secondary, color: COLORS.secondary }]}
        >
          Go to Home
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <Text style={[styles.title, { color: COLORS.text }]}>Checkout</Text>
      {cart.map(item => (
        <Card style={styles.productCard} key={item.id}>
          <Card.Content>
            <Image
              source={item.imageUrl}
              style={styles.productImage}
            />
            <Title style={[styles.productTitle, { color: COLORS.text }]}>{item.name}</Title>
            <Paragraph style={[styles.productPrice, { color: COLORS.text }]}>${item.price} x {item.quantity}</Paragraph>
          </Card.Content>
        </Card>
      ))}
      <Text style={[styles.total, { color: COLORS.text }]}>Total: ${total}</Text>
      <Button mode="contained" onPress={handleCheckout} style={[styles.checkoutButton, { backgroundColor: COLORS.primary }]}>
        Checkout
      </Button>
    </SafeAreaView>
  );
};

const Stack = createStackNavigator();

const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular: require('@expo-google-fonts/poppins/Poppins_400Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null; // You can return a loading spinner here
  }

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerLeft: () => null,
            }}
          />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    fontFamily: FONT_FAMILY, // Use the font here
  },
  productCard: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 5,
    backgroundColor: '#fff', // Ensure a white background for product cards
  },
  productCardContent: {
    padding: 10,
    justifyContent: 'space-between',
  },
  productList: {
    paddingBottom: 20,
  },
  productImage: {
    width: '100%', // Fill the entire width of the card
    height: 200, // Adjust the height to suit your design
    borderRadius: 10,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 18,
    marginBottom: 10,
  },
  addToCartButton: {
    marginTop: 10,
  },
  cartButton: {
    marginTop: 20,
    width: '100%',
  },
});

export default App;
