# 개요
Publisher가 데이터를 생성하여 Topic으로 보내면, 해당 Topic을 구독하는 Subscriber가 메시지를 소비하는 간단한 구조이다. 

- 주의 사항
  - Pub/Sub은 메시지를 디스크에 보관하지 않고, 단순히 메시지를 던지는 역할만 함.
  - Subscriber가 없는 상태에서 메시지 전송을 보장하지 않음

# Spring Boot 채팅 예제
## RedisConfig
```java
@Bean
public RedisMessageListenerContainer redisContainer(
        RedisConnectionFactory connectionFactory,
        MessageListenerAdapter messageListener
) {
    RedisMessageListenerContainer container = new RedisMessageListenerContainer();
    container.setConnectionFactory(connectionFactory);
    return container;
}

@Bean
public MessageListenerAdapter messageListener(RedisSubscriber subscriber) {
    return new MessageListenerAdapter(subscriber, "onMessage");
}

public void addTopic(String roomId, RedisMessageListenerContainer container, MessageListenerAdapter messageListener) {
    ChannelTopic topic = topics.computeIfAbsent(roomId, ChannelTopic::new);
    container.addMessageListener(messageListener, topic);
}
```
- redisContainer: 특정 토픽을 구독하고, 메시지 도착하면 지정된 MessageListener에게 메시지 전달
- messageListener: 특정 토픽으로 메시지 들어오면 RedisSubscriber 객체의 onMessage를 호출
- addTopic(): 새로운 토픽을 만들고,  RedisMessageListenerContainer를 통해 Redis 서버와 연결 관리

### 전체 흐름
1. messageListener와 redisContainer 빈 등록
2. 사용자가 특정 채팅방 입장하면 afterConnectionEstablished() 호출로 addTopic() 호출
3. addTopic()에서 roomId로 토픽 생성하고, redisContainer에 messageListenr와 함께 등록하여 구독 시작
4. RedisPublisher가 특정 채팅방 토픽으로 메시지 발행
5. redisContainer는 해당 토픽을 구독하고 있으므로 메시지 수신
6. 수신된 메시지를 messageListener에게 전달되고, 어댑터는 RedisSubscriber의 onMessage 메서드 호출하여 메시지 처리 로직 실행

## Publisher
```java
@Service
public class RedisPublisher {

    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    public RedisPublisher(
        @Qualifier("chatRedisTemplate") RedisTemplate<String, String> redisTemplate, ObjectMapper objectMapper
    ) {
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    public void publish(ChatMessage chatMessage) {
        try {
            String message = objectMapper.writeValueAsString(chatMessage);
            redisTemplate.convertAndSend("chat-room:" + chatMessage.getRoomId(), message);
        } catch (JsonProcessingException e) {
            log.error("Error serializing chat message", e);
        }
    }
}
```
- publish 시, redisTemplate.converAndSend로 호출
- "chat-room:1" Topic으로 message 전송
- `PUBLISH "chat-room:101" "{\"sender\":\"userA\", \"message\":\"안녕하세요\"}"` 가 실행됨

## Subscriber
```java
@Service
public class RedisSubscriber implements MessageListener {

    private final ObjectMapper objectMapper;
    private final ChatService chatService;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        try {
            String publishMessage = new String(message.getBody());
            ChatMessage chatMessage = objectMapper.readValue(publishMessage, ChatMessage.class);
            ChatRoom room = chatService.findRoomById(chatMessage.getRoomId());
            Set<WebSocketSession> sessions = room.getSessions();
            sendToEachSocket(sessions, new TextMessage(objectMapper.writeValueAsString(chatMessage)));
        } catch (IOException e) {
            log.error("Error processing message", e);
        }
    }

    private void sendToEachSocket(Set<WebSocketSession> sessions, TextMessage message){
        sessions.parallelStream().forEach(roomSession -> {
            try {
                roomSession.sendMessage(message);
            } catch (IOException e) {
                log.error(e.getMessage());
                throw new RuntimeException(e);
            }
        });
    }
}
```
- onMessage(Message message, byte[] pattern)
  - RedisConfig에서 설정한 RedisMessageListenerContainer가 특정 채널에서 메시지 감지하면 이 메서드 실행됨.
  - byte[] pattern: a메시지가 어떤 패턴의 채널로부터 왔는지 나타냄 (여기서는 사용안됨)


## WebSocket Handler
```java
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final ChatService chatService;
    private final ChatRecentMessageService chatRecentMessageService;
    private final RedisPublisher redisPublisher;
    private final RedisMessageListenerContainer redisContainer;
    private final MessageListenerAdapter messageListener;
    private final RedisConfig redisConfig;

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        ChatMessage chatMessage = chatService.createMessage(message);
        ChatRoom room = chatService.findRoomById(chatMessage.getRoomId());
        Set<WebSocketSession> sessions = room.getSessions();

        if (chatMessage.getType().equals(MessageType.ENTER)) {
            sessions.add(session);
            chatMessage.setMessage(chatMessage.getSender() + "님이 입장했습니다.");
            sendToEachSocket(sessions,new TextMessage(objectMapper.writeValueAsString(chatMessage)));
        } else if (chatMessage.getType().equals(MessageType.QUIT)) {
            sessions.remove(session);
            chatMessage.setMessage(chatMessage.getSender() + "님이 퇴장했습니다..");
            sendToEachSocket(sessions,new TextMessage(objectMapper.writeValueAsString(chatMessage)));
        } else {
            redisPublisher.publish(chatMessage);
            chatService.saveTextMessage(chatMessage);
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String roomId = getRoomIdFromSession(session);
        if (roomId != null) {
            ChatRoom room = chatService.findRoomById(roomId);
            room.getSessions().add(session); // 세션 추가
            session.getAttributes().put("roomId", roomId);

            redisConfig.addTopic(roomId, redisContainer, messageListener);

            ChatMessage chatMessage = ChatMessage.builder()
                    .type(MessageType.ENTER)
                    .roomId(roomId)
                    .sender("SERVER")
                    .message("Connection Established")
                    .build();
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(chatMessage)));
            chatRecentMessageService.getRecentMessages(roomId);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String roomId = (String) session.getAttributes().get("roomId");
        if (roomId != null) {
            ChatRoom room = chatService.findRoomById(roomId);
            Set<WebSocketSession> sessions = room.getSessions();
            sessions.remove(session);
        }
    }

    private void sendToEachSocket(Set<WebSocketSession> sessions, TextMessage message){
        sessions.parallelStream().forEach(roomSession -> {
            try {
                roomSession.sendMessage(message);
            } catch (IOException e) {
                log.error(e.getMessage());
                throw new RuntimeException(e);
            }
        });
    }

    private String getRoomIdFromSession(WebSocketSession session) {
        String[] pathSegments = session.getUri().getPath().split("/");
        if (pathSegments.length > 0) {
            return pathSegments[pathSegments.length - 1];
        }
        return null;
    }
}
```