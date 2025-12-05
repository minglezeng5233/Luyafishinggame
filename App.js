import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// 鱼类数据库
const fishDatabase = [
  { id: 1, name: "鲤鱼", species: "淡水鱼", rarity: "common", minSize: 1.0, maxSize: 3.0, price: 10, emoji: "🐟" },
  { id: 2, name: "黑鲈", species: "淡水鱼", rarity: "common", minSize: 0.8, maxSize: 2.5, price: 15, emoji: "🐟" },
  { id: 3, name: "鳜鱼", species: "淡水鱼", rarity: "uncommon", minSize: 0.5, maxSize: 2.0, price: 25, emoji: "🐠" },
  { id: 4, name: "鲶鱼", species: "淡水鱼", rarity: "uncommon", minSize: 1.5, maxSize: 4.0, price: 20, emoji: "🐡" },
  { id: 5, name: "海鲈", species: "海水鱼", rarity: "rare", minSize: 2.0, maxSize: 6.0, price: 50, emoji: "🦈" },
  { id: 6, name: "金枪鱼", species: "海水鱼", rarity: "rare", minSize: 5.0, maxSize: 15.0, price: 100, emoji: "🐟" },
  { id: 7, name: "鲨鱼", species: "海水鱼", rarity: "legendary", minSize: 10.0, maxSize: 30.0, price: 500, emoji: "🦈" },
  { id: 8, name: "龙鱼", species: "淡水鱼", rarity: "legendary", minSize: 2.0, maxSize: 8.0, price: 300, emoji: "🐉" }
];

const rarityConfig = {
  common: { name: "普通", color: "#9CA3AF", bgColor: "#F3F4F6", rate: 0.5 },
  uncommon: { name: "稀有", color: "#10B981", bgColor: "#D1FAE5", rate: 0.3 },
  rare: { name: "珍稀", color: "#3B82F6", bgColor: "#DBEAFE", rate: 0.15 },
  legendary: { name: "传说", color: "#F59E0B", bgColor: "#FEF3C7", rate: 0.05 }
};

export default function App() {
  const [gameState, setGameState] = useState('main');
  const [player, setPlayer] = useState({
    level: 1,
    experience: 0,
    gold: 100,
    diamonds: 0
  });
  const [isFishing, setIsFishing] = useState(false);
  const [currentFish, setCurrentFish] = useState(null);
  const [caughtFish, setCaughtFish] = useState([]);
  const [showCatch, setShowCatch] = useState(false);
  const [fishingMessage, setFishingMessage] = useState('');
  const [fishingTimer, setFishingTimer] = useState(0);

  // 计时器效果
  useEffect(() => {
    let interval;
    if (isFishing) {
      interval = setInterval(() => {
        setFishingTimer(prev => prev + 1);
      }, 1000);
    } else {
      setFishingTimer(0);
    }
    return () => clearInterval(interval);
  }, [isFishing]);

  // 随机钓鱼函数
  const startFishing = () => {
    if (isFishing) return;
    
    setIsFishing(true);
    setShowCatch(false);
    setFishingMessage('🎣 抛竿中...');
    setFishingTimer(0);
    
    // 阶段性消息
    setTimeout(() => {
      setFishingMessage('⏳ 等待鱼儿上钩...');
    }, 1000);
    
    setTimeout(() => {
      if (isFishing) {
        setFishingMessage('🎯 有动静了！');
      }
    }, 2500 + Math.random() * 1500);
    
    // 模拟钓鱼时间
    setTimeout(() => {
      // 随机选择稀有度
      const random = Math.random();
      let accumulated = 0;
      let selectedRarity = 'common';
      
      for (const [rarity, config] of Object.entries(rarityConfig)) {
        accumulated += config.rate;
        if (random <= accumulated) {
          selectedRarity = rarity;
          break;
        }
      }
      
      // 选择对应稀有度的鱼
      const availableFish = fishDatabase.filter(f => f.rarity === selectedRarity);
      const fish = availableFish[Math.floor(Math.random() * availableFish.length)];
      
      // 计算鱼的大小和价值
      const size = fish.minSize + Math.random() * (fish.maxSize - fish.minSize);
      const value = Math.floor(fish.price * (size / fish.minSize));
      
      const caughtData = { 
        ...fish, 
        size: parseFloat(size.toFixed(1)), 
        value,
        catchTime: new Date().toISOString()
      };
      
      setCurrentFish(caughtData);
      setShowCatch(true);
      setIsFishing(false);
      setFishingMessage('');
      
      // 更新游戏状态
      const newExp = player.experience + Math.floor(value / 5);
      const newLevel = Math.floor(newExp / 100) + 1;
      
      setPlayer(prev => ({
        ...prev,
        gold: prev.gold + value,
        experience: newExp,
        level: newLevel
      }));
      
      setCaughtFish(prev => [...prev, caughtData]);
      
      // 升级提示
      if (newLevel > player.level) {
        setTimeout(() => {
          Alert.alert(
            '🎉 升级了！',
            `恭喜你升到了${newLevel}级！\n获得${newLevel * 10}金币奖励！`,
            [{ text: '确定', onPress: () => {} }]
          );
          setPlayer(prev => ({
            ...prev,
            gold: prev.gold + newLevel * 10
          }));
        }, 1000);
      }
      
    }, 3000 + Math.random() * 4000);
  };

  // 主界面组件
  const MainScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎣 路亚钓鱼大师</Text>
        <Text style={styles.subtitle}>成为钓鱼传奇</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>等级</Text>
          <Text style={styles.statValue}>{player.level}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>💰 金币</Text>
          <Text style={styles.statValue}>{player.gold}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>💎 钻石</Text>
          <Text style={styles.statValue}>{player.diamonds}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>🐟 已捕获</Text>
          <Text style={styles.statValue}>{caughtFish.length}</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>经验值: {player.experience % 100}/100 (下一级: {player.level + 1})</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(player.experience % 100)}%` }]} />
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.startButton}
        onPress={() => setGameState('fishing')}
        activeOpacity={0.8}
      >
        <Text style={styles.startButtonText}>🎣 开始钓鱼</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => setGameState('collection')}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>📚 图鉴</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.secondaryButton}
        onPress={() => setGameState('shop')}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>🛒 商店</Text>
      </TouchableOpacity>
    </View>
  );

  // 钓鱼界面组件
  const FishingScreen = () => (
    <View style={styles.container}>
      <View style={styles.fishingHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setGameState('main')}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <View style={styles.fishingStats}>
          <Text style={styles.fishingStatText}>等级 {player.level}</Text>
          <Text style={styles.fishingStatText}>💰 {player.gold}</Text>
        </View>
      </View>

      <View style={styles.fishingArea}>
        <View style={styles.waterArea}>
          <Text style={styles.waterEmoji}>🌊</Text>
          <Text style={styles.waterEmoji}>🌊</Text>
          <Text style={styles.waterEmoji}>🌊</Text>
        </View>
        
        {fishingMessage && (
          <View style={styles.fishingMessageContainer}>
            <Text style={styles.fishingMessage}>{fishingMessage}</Text>
            {isFishing && (
              <Text style={styles.fishingTimer}>⏱️ {fishingTimer}秒</Text>
            )}
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.fishingButton, isFishing && styles.fishingButtonDisabled]}
          onPress={startFishing}
          disabled={isFishing}
          activeOpacity={0.8}
        >
          <Text style={styles.fishingButtonText}>
            {isFishing ? '🎣' : '🎣'}
          </Text>
          <Text style={styles.fishingButtonLabel}>
            {isFishing ? '钓鱼中...' : '抛竿'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 捕获成功弹窗 */}
      {showCatch && currentFish && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={showCatch}
          onRequestClose={() => setShowCatch(false)}
        >
          <View style={styles.catchModal}>
            <View style={styles.catchContent}>
              <Text style={styles.catchEmoji}>{currentFish.emoji}</Text>
              <Text style={styles.catchTitle}>🎉 捕获成功！</Text>
              <Text style={styles.catchFishName}>{currentFish.name}</Text>
              <View style={[styles.rarityBadge, { backgroundColor: rarityConfig[currentFish.rarity].bgColor }]}>
                <Text style={[styles.rarityText, { color: rarityConfig[currentFish.rarity].color }]}>
                  {rarityConfig[currentFish.rarity].name}
                </Text>
              </View>
              <Text style={styles.catchDetail}>重量: {currentFish.size}kg</Text>
              <Text style={styles.catchDetail}>价值: {currentFish.value} 金币</Text>
              <TouchableOpacity 
                style={styles.catchButton}
                onPress={() => setShowCatch(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.catchButtonText}>确定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );

  // 图鉴界面组件
  const CollectionScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setGameState('main')}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📚 鱼类图鉴</Text>
      </View>
      
      <View style={styles.collectionStats}>
        <Text style={styles.collectionText}>
          已收集: {caughtFish.length}/{fishDatabase.length} 种
        </Text>
        <Text style={styles.collectionText}>
          收集进度: {Math.round(caughtFish.length / fishDatabase.length * 100)}%
        </Text>
      </View>
      
      <View style={styles.fishGrid}>
        {fishDatabase.map(fish => {
          const isCaught = caughtFish.some(c => c.id === fish.id);
          const caughtData = caughtFish.find(c => c.id === fish.id);
          
          return (
            <View key={fish.id} style={[styles.fishCard, !isCaught && styles.fishCardLocked]}>
              <Text style={styles.fishEmoji}>{isCaught ? fish.emoji : '❓'}</Text>
              <Text style={[styles.fishName, !isCaught && styles.lockedText]}>
                {isCaught ? fish.name : '未知鱼类'}
              </Text>
              {isCaught && caughtData && (
                <Text style={styles.fishSize}>{caughtData.size}kg</Text>
              )}
              {isCaught && (
                <View style={[styles.miniRarityBadge, { backgroundColor: rarityConfig[fish.rarity].bgColor }]}>
                  <Text style={[styles.miniRarityText, { color: rarityConfig[fish.rarity].color }]}>
                    {rarityConfig[fish.rarity].name}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );

  // 商店界面组件
  const ShopScreen = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setGameState('main')}
        >
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🛒 钓具商店</Text>
      </View>
      
      <View style={styles.shopStats}>
        <Text style={styles.shopGoldText}>💰 当前金币: {player.gold}</Text>
      </View>
      
      <View style={styles.shopContainer}>
        <Text style={styles.shopTitle}>🎣 钓竿</Text>
        <View style={styles.shopItem}>
          <Text style={styles.shopItemName}>入门钓竿</Text>
          <Text style={styles.shopItemPrice}>💰 50</Text>
          <TouchableOpacity style={player.gold >= 50 ? styles.buyButton : styles.buyButtonDisabled}>
            <Text style={styles.buyButtonText}>购买</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.shopTitle}>🐛 拟饵</Text>
        <View style={styles.shopItem}>
          <Text style={styles.shopItemName}>基础拟饵</Text>
          <Text style={styles.shopItemPrice}>💰 20</Text>
          <TouchableOpacity style={player.gold >= 20 ? styles.buyButton : styles.buyButtonDisabled}>
            <Text style={styles.buyButtonText}>购买</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // 根据游戏状态渲染不同界面
  return (
    <>
      <StatusBar style="light" />
      {gameState === 'main' && <MainScreen />}
      {gameState === 'fishing' && <FishingScreen />}
      {gameState === 'collection' && <CollectionScreen />}
      {gameState === 'shop' && <ShopScreen />}
    </>
  );
}

// 样式定义
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    width: width * 0.4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 5,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  progressText: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  startButton: {
    backgroundColor: '#10B981',
    marginHorizontal: 20,
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fishingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  fishingStats: {
    flexDirection: 'row',
  },
  fishingStatText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: 15,
  },
  fishingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  waterArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  waterEmoji: {
    fontSize: 40,
    marginHorizontal: 10,
  },
  fishingMessageContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  fishingMessage: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  fishingTimer: {
    fontSize: 14,
    color: '#94A3B8',
  },
  fishingButton: {
    backgroundColor: '#10B981',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fishingButtonDisabled: {
    backgroundColor: '#6B7280',
  },
  fishingButtonText: {
    fontSize: 40,
    marginBottom: 5,
  },
  fishingButtonLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  catchModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  catchContent: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  catchEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  catchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 10,
  },
  catchFishName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 15,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  catchDetail: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 5,
  },
  catchButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 15,
  },
  catchButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  collectionStats: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  collectionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginVertical: 2,
  },
  fishGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  fishCard: {
    width: width * 0.4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    margin: 8,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  fishCardLocked: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    opacity: 0.6,
  },
  fishEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  fishName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  fishSize: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  miniRarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniRarityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  lockedText: {
    color: '#6B7280',
  },
  shopStats: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  shopGoldText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  shopContainer: {
    flex: 1,
    padding: 20,
  },
  shopTitle: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  shopItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shopItemName: {
    fontSize: 16,
    color: '#FFFFFF',
    flex: 1,
  },
  shopItemPrice: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: 'bold',
    marginHorizontal: 15,
  },
  buyButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonDisabled: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});