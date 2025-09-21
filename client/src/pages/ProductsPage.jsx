import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';

// Import product images
import lipBalmImage from '../assets/lip bam.jpeg';
import tintedLipBalmImage from '../assets/tinted lip bam.jpeg';
import bhringadiShampooImage from '../assets/bhringadi-shampoo.jpeg';
import hairOilImage from '../assets/hair oil.jpeg';
import kesudaSoapImage from '../assets/kesuda-soap.jpeg';
import roseSoapImage from '../assets/rose-soap.jpeg';
import multaniMittiSoapImage from '../assets/multani-mitti-soap.jpeg';
import roseFoamingFaceWashImage from '../assets/rose foaming face wash.jpeg';
import brightingFaceOilImage from '../assets/brighting face oil.jpeg';
import brighteningBodyWashImage from '../assets/brightening body wash.jpeg';
import roseWaterImage from '../assets/rose water.jpeg';
import waxImage from '../assets/wax.jpeg';
import swarnaprashanImage from '../assets/swarnaprashan.jpeg';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };
  
  const products = [
    {
      id: 1,
      name: "Lip Balm (5gm)",
      price: "₹100",
      originalPrice: "₹149",
      image: lipBalmImage,
      category: "Lip care",
      
      description: "SOOTHE AND REPAIR CHAPPED AND DRY LIPS,HYDRATES LIP AREA,ITS A NON-TINTED LIP BALM.",
      benefits: ["Moisturizing", "Healing", "Protection"]
    },
    {
      id: 2,
      name: "Tinted Lip Balm",
      price: "₹150",
      originalPrice: "₹550",
      image: tintedLipBalmImage,
      category: "Lip care",
      
      description: "NATURAL LIP BALM,FREE FROM HARMFUL COLORS, CHEMICALS AND PRESERVATIVES",
      benefits: ["Natural Tint", "Chemical-Free", "Moisturizing"]
    },
    {
      id: 3,
      name: "Bhringadi Shampoo",
      price: "₹250",
      originalPrice: "₹380",
      image: bhringadiShampooImage,
      category: "Hair care",
      
      description: "NOURISHES HAIR AND SCALP,GENTLY CLEANSES THE IMPURITIES OF SCALP,PREVENT HAIRFALL.",
      benefits: ["Hair Growth", "Dandruff Control", "Scalp Health"]
    },
    {
      id: 4,
      name: "Bhringadi Hair Oil",
      price: "₹280",
      originalPrice: "₹825",
      image: hairOilImage,
      category: "Hair care",
      
      description: "PROMOTES HAIR GROWTH,PREVENTS HAIR DAMAGE,STOPS HAIR FALL",
      benefits: ["Hair Growth", "Damage Repair", "Hair Fall Control"]
    },
    {
      id: 5,
      name: "Sandalwood Soap",
      price: "₹70",
      originalPrice: "₹790",
      image: kesudaSoapImage,
      category: "Body care",
      
      description: "BRIGHTENS THE SKIN,REDUCES BODY TANNING,MOISTURIZES THE SKIN",
      benefits: ["Brightening", "Anti-Tan", "Moisturizing"]
    },
    {
      id: 6,
      name: "Kesuda Soap",
      price: "₹60",
      originalPrice: "₹450",
      image: kesudaSoapImage,
      category: "Body care",
      
      description: "IT COOLS DOWN THE SKIN,REMOVE TANNING,PREVENTS ACNE AND PIMPLES",
      benefits: ["Cooling", "Anti-Tan", "Anti-Acne"]
    },
    {
      id: 7,
      name: "Rose Soap",
      price: "₹70",
      originalPrice: "₹450",
      image: roseSoapImage,
      category: "Body care",
      
      description: "REJUVENATE THE SKIN,GIVES A REFRESHING EFFECTS TO THE SKIN,MOISTURIZES THE SKIN",
      benefits: ["Rejuvenating", "Refreshing", "Moisturizing"]
    },
    {
      id: 8,
      name: "Multani Mitti Soap",
      price: "₹60",
      originalPrice: "₹450",
      image: multaniMittiSoapImage,
      category: "Body care",
      
      description: "BRIGHTENS THE SKIN,REDUCES BODY TANNING,REDUCES ACNE,REMOVES SKIN INFECTIONS",
      benefits: ["Brightening", "Anti-Acne", "Purifying"]
    },
    {
      id: 9,
      name: "Rose Foaming Face Wash",
      price: "₹170",
      originalPrice: "₹450",
      image: roseFoamingFaceWashImage,
      category: "Face care",
      
      description: "ROSE FOAMING FACE WASH DEEP CLEANSES FACE AND HYDRATE THE SKIN",
      benefits: ["Deep Cleansing", "Hydrating", "Rose Extract"]
    },
    {
      id: 10,
      name: "Brightening Face Oil",
      price: "₹250",
      originalPrice: "₹450",
      image: brightingFaceOilImage,
      category: "Face care",
      
      description: "BRIGHTENING FACE OIL DEEP CLEANSES FACE AND HYDRATE THE SKIN",
      benefits: ["Brightening", "Deep Cleansing", "Hydrating"]
    },
    {
      id: 11,
      name: "Brightening Body Wash",
      price: "₹250",
      originalPrice: "₹450",
      image: brighteningBodyWashImage,
      category: "Skin care",
      
      description: "BODY WASH REMOVES IMPURITIES,AND DIRT FROM SKIN, HYDRATE THE,SKIN AND BRIGHTENING THE SKIN",
      benefits: ["Purifying", "Hydrating", "Brightening"]
    },
    {
      id: 12,
      name: "Rose Water",
      price: "₹120",
      originalPrice: "₹450",
      image: roseWaterImage,
      category: "Skin care",
      
      description: "HYDRATES SKIN,ACNE CONTROL,OIL CONTROL,TONER FOR SKIN,REDUCE PORES,SOOTHES REDNESS AND RASHES",
      benefits: ["Hydrating", "Acne Control", "Toning"]
    },
     {
      id: 13,
      name: "Ayur Wax Painless Hair Removal Powder",
      price: "₹200",
      originalPrice: "₹450",
      image: waxImage,
      category: "Other",
      description: "PAINLESS AND EASY TO USE,ALL AYURVEDA INGREDIENTS MAKES SKIN LUSTROUS AND HYDRATED",
      benefits: ["Painless", "Natural", "Hydrating"]
    },
     {
      id: 14,
      name: "Swarnaprasan (Gold Drops)",
      price: "₹650",
      originalPrice: "₹450",
      image: swarnaprashanImage,
      category: "Other",
      description: "FOR CHILDREN FROM BIRTH TO 16 YEARS OLD,BOOST IMMUNITY,IMPROVES MEMORY AND CONCENTRATION,IMPROVES SLEEP QUALITY",
      benefits: ["Immunity Boost", "Memory", "Sleep Quality"]
    },
    
    
  ];

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'Lip care', name: 'Lip Care' },
    { id: 'Hair care', name: 'Hair Care' },
    { id: 'Body care', name: 'Body Care' },
    { id: 'Face care', name: 'Face Care' },
    { id: 'Skin care', name: 'Skin Care' },
    { id: 'Other', name: 'Other' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  

  return (
    <div className="main-layout">
      <Navbar />
      <div className="page-container">
        <header className="products-header">
          <h1>Our Premium Products</h1>
          <p>Discover authentic Ayurvedic medicines crafted with traditional wisdom</p>
        </header>
        
        <div className="products-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="products-showcase">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-showcase-card">
              <div className="product-badge">
              
              </div>
              
              <div className="product-image-container">
                {typeof product.image === 'string' && product.image.includes('.') ? (
                  <img src={product.image} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-emoji">{product.image}</div>
                )}
              </div>
              
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
                
                <div className="product-benefits">
                  {product.benefits.map((benefit, index) => (
                    <span key={index} className="benefit-tag">{benefit}</span>
                  ))}
                </div>
                
                
                
                <div className="product-pricing">
                  <div className="price-container">
                    <span className="current-price">{product.price}</span>
                    <span className="original-price">{product.originalPrice}</span>
                  </div>
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}