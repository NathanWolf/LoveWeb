<?php
class SessionConversation implements ConversationInterface
{
    protected int $chat_id;
    protected string $title;
    protected string $targetPersonaId;
    protected int|null $targetAlternativeId;
    protected string|null $sourcePersonaId;
    protected int|null $sourceAlternativeId;

    public function __construct() {
        self::init_session();

        if( empty( $_SESSION['chats'] ) ) {
            $_SESSION['chats'] = [];
        }
    }

    public function setTargetPersonaId(string|null $targetPersonaId): void {
        $this->targetPersonaId = $targetPersonaId;
    }

    public function setSourcePersonaId(string|null $sourcePersonaId): void {
        $this->sourcePersonaId = $sourcePersonaId;
    }

    public function setSourceAlternativeId(int|null $sourceAlternativeId): void {
        $this->sourceAlternativeId = $sourceAlternativeId;
    }

    public function setTargetAlternativeId(int|null $targetAlternativeId): void {
        $this->targetAlternativeId = $targetAlternativeId;
    }

    public function setUserId(string|null $userId): void {
    }

    public function getUserId(): string|null {
        return null;
    }

    public function setAnonymous(bool $anonymous): void {
    }

    public function getTargetPersonaId(): string|null {
        return $this->targetPersonaId;
    }

    public function getSourcePersonaId(): string|null {
        return $this->sourcePersonaId;
    }

    public function getSourceAlternativeId(): int|null {
        return $this->sourceAlternativeId;
    }

    public function getTargetAlternativeId(): int|null {
        return $this->targetAlternativeId;
    }

    public function getAnonymous(): bool {
        return true;
    }

    public function resume(): void {

    }

    protected static function init_session() {
        if( session_status() !== PHP_SESSION_ACTIVE ) {
            session_start();
        }
    }

    /**
     * @return array<self>
     */
    public function get_chats(): array {
        self::init_session();
        $chats = $_SESSION['chats'] ?? [];
        $chats = array_reverse( $chats );

        $list = [];

        foreach( $chats as $data ) {
            if (!isset($data['target_persona_id'])) continue;
            $conversation = new self();
            $conversation->set_id( $data['id'] );
            $conversation->set_title( $data['title'] );
            $conversation->setSourcePersonaId( $data['source_persona_id'] ?? null );
            $conversation->setTargetPersonaId( $data['target_persona_id'] );
            $conversation->setSourceAlternativeId( $data['source_alternative_id'] ?? null );
            $conversation->setTargetAlternativeId( $data['target_alternative_id'] ?? null );

            $list[] = $conversation;
        }

        return $list;
    }

    public function find( int $chat_id  ): self|false {
        self::init_session();
        $data = $_SESSION['chats'][$chat_id] ?? [];

        if( empty( $data ) || !isset($data['target_persona_id']) ) {
            return false;
        }

        $conversation = new self();
        $conversation->set_id( $data['id'] );
        $conversation->set_title( $data['title'] );
        $conversation->setSourcePersonaId( $data['source_persona_id'] ?? null );
        $conversation->setTargetPersonaId( $data['target_persona_id'] );
        $conversation->setSourceAlternativeId( $data['source_alternative_id'] ?? null );
        $conversation->setTargetAlternativeId( $data['target_alternative_id'] ?? null );

        return $conversation;
    }

    public function updateSystem($prompt): bool {
        if( ! isset( $this->chat_id ) ) {
            return false;
        }
        $messages = &$_SESSION['chats'][$this->chat_id]["messages"];
        foreach ($messages as &$message) {
            if ($message['role'] === 'system') {
                $message['content'] = $prompt;
                return true;
            }
        }
        return false;
    }

    public function get_messages(): array {
        if( ! isset( $this->chat_id ) ) {
            return [];
        }

        return $_SESSION['chats'][$this->chat_id]["messages"] ?? [];
    }

    public function add_message( $message ): int {
        $id = $_SESSION['chats'][$this->chat_id]["messages"] ? count($_SESSION['chats'][$this->chat_id]["messages"]) : 0;
        $message['id'] = $id;
        $_SESSION['chats'][$this->chat_id]["messages"][] = $message;
        return $id;
    }

    public function edit_message( $messageId, $message ) {
        $_SESSION['chats'][$this->chat_id]["messages"][$messageId]['content'] = $message;
    }

    public function delete_message( $messageId, bool $following ) {
        $messages = array();
        foreach ($_SESSION['chats'][$this->chat_id]["messages"] as $index => $message) {
            if ($following) {
                if ($index < $messageId) {
                    $messages[] = $message;
                }
            } else {
                if ($index != $messageId) {
                    $messages[] = $message;
                }
            }
        }
        $_SESSION['chats'][$this->chat_id]["messages"] = $messages;
    }

    public function set_id( string $id ) {
        $this->chat_id = $id;
    }

    public function set_title( string $title ) {
        $this->title = $title;
    }

    public function get_id() {
        return $this->chat_id;
    }

    public function get_title() {
        return $this->title;
    }

    public function save(): int {
        if( ! isset( $this->chat_id ) ) {
            $this->chat_id = $_SESSION['next_chat_id'] ?? 0;
            $_SESSION['next_chat_id'] = $this->chat_id + 1;
            $_SESSION['chats'][$this->chat_id] = [
                "id" => $this->chat_id,
                "title" => $this->title,
                'source_persona_id' => $this->sourcePersonaId,
                'target_persona_id' => $this->targetPersonaId,
                'source_alternative_id' => $this->sourceAlternativeId,
                'target_alternative_id' => $this->targetAlternativeId,
                "messages" => [],
            ];
        } else {
            $_SESSION['chats'][$this->chat_id] = [
                "id" => $this->chat_id,
                "title" => $this->title,
                'source_persona_id' => $this->sourcePersonaId,
                'target_persona_id' => $this->targetPersonaId,
                'source_alternative_id' => $this->sourceAlternativeId,
                'target_alternative_id' => $this->targetAlternativeId,
                "messages" => $this->get_messages(),
            ];
        }

        return $this->chat_id;
    }

    public function delete(): void {
        unset( $_SESSION['chats'][$this->chat_id] );
    }

    public function getData(): array {
        return array(
            "id" => $this->chat_id,
            "title" => $this->title,
            'source_persona_id' => $this->sourcePersonaId,
            'target_persona_id' => $this->targetPersonaId,
            'source_alternative_id' => $this->sourceAlternativeId,
            'target_alternative_id' => $this->targetAlternativeId,
            'anonymous' => true
        );
    }
}
