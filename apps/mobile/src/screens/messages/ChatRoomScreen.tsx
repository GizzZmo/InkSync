import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { MessagesStackParamList, Message } from '../../types';
import * as messageService from '../../services/messageService';
import { useAuthStore } from '../../store/authStore';

type Props = {
  navigation: NativeStackNavigationProp<MessagesStackParamList, 'ChatRoom'>;
  route: RouteProp<MessagesStackParamList, 'ChatRoom'>;
};

export default function ChatRoomScreen({ route }: Props) {
  const { roomId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { user } = useAuthStore();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load message history
    messageService.getMessages(roomId)
      .then((res) => setMessages(res.messages ?? []))
      .catch(console.error);

    // Connect socket
    messageService.connectSocket().then((socket) => {
      socket.emit('join_room', roomId);
      socket.on('new_message', (msg: Message) => {
        setMessages((prev) => [...prev, msg]);
      });
    });

    return () => {
      messageService.disconnectSocket();
    };
  }, [roomId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const socket = messageService.getSocket();
    if (socket) {
      socket.emit('send_message', { roomId, content: input.trim() });
    } else {
      await messageService.sendMessage(roomId, input.trim());
    }
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMe = item.senderId === user?.id;
          return (
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
              {!isMe && <Text style={styles.senderName}>{item.sender.firstName}</Text>}
              <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.content}</Text>
            </View>
          );
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={styles.sendBtnText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  messageList: { padding: 16 },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: '#6366f1' },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0' },
  bubbleText: { color: '#333', fontSize: 15 },
  bubbleTextMe: { color: '#fff' },
  senderName: { fontSize: 12, color: '#888', marginBottom: 4 },
  inputRow: { flexDirection: 'row', padding: 12, borderTopWidth: 1, borderTopColor: '#eee', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, fontSize: 15 },
  sendBtn: { backgroundColor: '#6366f1', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontWeight: '600' },
});
