  import React, { createContext, useContext, useState } from 'react';
import { SafeAreaView, FlatList, View, Alert, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useFonts } from 'expo-font';

const COLORS = {
  primary: '#4caf50',
  secondary: '#f8a5c2',
  accent: '#f1c40f',
  background: '#f5f5f5',
  text: '#2d3436',
  cardBackground: '#fff',
  border: '#ddd',
};

const FONT_FAMILY = 'Poppins_400Regular';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
  description: string;
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

const products = [
  { 
    id: '1', 
    name: 'Hotdog Sparkling Water', 
    price: 5, 
    imageUrl: require('./assets/bigbite.png'), 
    description: 'A refreshing sparkling water with a unique hotdog flavor!' 
  },
  { 
    id: '2', 
    name: 'Meatball Gum', 
    price: 10, 
    imageUrl: require('./assets/meatball.png'), 
    description: 'Chew on these delicious meatball-flavored gums for a savory treat!' 
  },
  { 
    id: '3', 
    name: 'Sour Patch for Adults', 
    price: 10, 
    imageUrl: require('./assets/sourpatch.png'), 
    description: 'A tangy twist on the classic sour patch, now with a more intense kick!' 
  },
];

const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { addToCart } = useCart();
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddToCart = (item: CartItem) => {
    addToCart(item);
    Alert.alert('Item Added', `${item.name} has been added to your cart.`);
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowFullImage(true);
  };

  const closeFullImage = () => {
    setShowFullImage(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <Card style={styles.productCard}>
            <Card.Content style={styles.productCardContent}>
              <TouchableOpacity onPress={() => handleImageClick(item.imageUrl)}>
                <Image
                  source={item.imageUrl}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              <Title style={[styles.productTitle, { color: COLORS.text }]}>{item.name}</Title>
              <Paragraph style={[styles.productPrice, { color: COLORS.text }]}>${item.price}</Paragraph>
              <Paragraph style={[styles.productDescription, { color: COLORS.text }]}>
                {item.description}
              </Paragraph>
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

      {showFullImage && selectedImage && (
        <View style={styles.fullImageModal}>
          <TouchableOpacity onPress={closeFullImage} style={styles.closeButton}>
            <Text style={{ color: '#fff', fontSize: 20 }}>Close</Text>
          </TouchableOpacity>
          <Image source={selectedImage} style={styles.fullImage} resizeMode="contain" />
        </View>
      )}
    </SafeAreaView>
  );
};

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
                  style={styles.quantityButton}
                >
                  -
                </Button>
                <Button
                  mode="outlined"
                  onPress={() => handleQuantityChange(item.id, 'increase')}
                  style={styles.quantityButton}
                >
                  +
                </Button>
                <Button
                  mode="text"
                  onPress={() => removeFromCart(item.id)}
                  style={[styles.removeButton, { color: COLORS.accent }]}>
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

  if (cart.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]}>
        <Text style={[styles.title, { color: COLORS.text }]}>Checkout</Text>
        <Text style={[styles.emptyCartMessage, { color: '#D32F2F' }]}>
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
    return null;
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
    padding: 15,
    fontFamily: FONT_FAMILY,
  },
  productCard: {
    marginBottom: 15,
    borderRadius: 15,
    elevation: 6,
    backgroundColor: COLORS.cardBackground,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  productCardContent: {
    padding: 15,
    justifyContent: 'space-between',
  },
  productList: {
    paddingBottom: 20,
  },
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 10,
  },
  addToCartButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 5,
  },
  cartButton: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 10,
  },
  checkoutButton: {
    marginTop: 20,
    width: '100%',
    paddingVertical: 12,
  },
  quantityButton: {
    marginHorizontal: 5,
    borderColor: COLORS.primary,
  },
  removeButton: {
    marginTop: 10,
  },
  total: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
  },
  emptyCartMessage: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  fullImageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  fullImage: {
    width: '90%',
    height: '80%',
    borderRadius: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
});

export default App;
