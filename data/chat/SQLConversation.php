<?php
class SQLConversation implements ConversationInterface
{
    protected int $chat_id;
    protected string $title;
    protected string $userId;
    protected string|null $targetPersonaId;
    protected string|null $targetRealmId;
    protected int|null $targetAlternativeId;
    protected string|null $sourcePersonaId;
    protected int|null $sourceAlternativeId;
    protected string $updated;
    protected bool $anonymous;

    public function __construct( protected PDO $db ) {
        $this->updated = date("Y-m-d H:i:s");
    }

    public function setUserId(string|null $userId): void {
        $this->userId = $userId;
    }

    public function getUserId(): string|null {
        return $this->userId;
    }

    public function setUpdated(string $updated): void {
        $this->updated = $updated;
    }

    public function setTargetPersonaId(string|null $targetPersonaId): void {
        $this->targetPersonaId = $targetPersonaId;
    }

    public function setTargetRealmId(string|null $targetRealmId): void {
        $this->targetRealmId = $targetRealmId;
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

    public function setAnonymous(bool $anonymous): void {
        $this->anonymous = $anonymous;
    }

    public function getTargetPersonaId(): string|null {
        return $this->targetPersonaId;
    }

    public function getTargetRealmId(): string|null {
        return $this->targetRealmId;
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
        return $this->anonymous;
    }

    /**
     * @return array<self>
     */
    public function get_chats(): array {
        $stmt = $this->db->prepare( "SELECT * FROM conversation WHERE user_id = :user ORDER BY updated DESC" );
        $stmt->execute( [
            ":user" => $this->userId,
        ] );
        $chats = $stmt->fetchAll( PDO::FETCH_ASSOC );

        $list = [];

        foreach( $chats as $data ) {
            $conversation = new self( $this->db );
            $conversation->set_id( $data['id'] );
            $conversation->set_title( $data['title'] );
            $conversation->setTargetPersonaId( $data['target_persona_id'] );
            $conversation->setTargetRealmId( $data['target_realm_id'] );
            $conversation->setSourcePersonaId( $data['source_persona_id'] );
            $conversation->setSourceAlternativeId( $data['source_alternative_id'] );
            $conversation->setTargetAlternativeId( $data['target_alternative_id'] );
            $conversation->setAnonymous( $data['anonymous'] );
            $conversation->setUserId( $data['user_id'] );
            $conversation->setUpdated( $data['updated'] );

            $list[] = $conversation;
        }

        return $list;
    }

    public function find( int $chat_id ): self|false {
        $stmt = $this->db->prepare( "SELECT * FROM conversation WHERE id = :chat_id" );
        $stmt->execute( [
            ":chat_id" => $chat_id,
        ] );

        $data = $stmt->fetch( PDO::FETCH_ASSOC );

        if( empty( $data ) ) {
            return false;
        }

        $conversation = new self( $this->db );
        $conversation->set_id( $data['id'] );
        $conversation->set_title( $data['title'] );
        $conversation->setUserId( $data['user_id'] );
        $conversation->setSourcePersonaId( $data['source_persona_id'] );
        $conversation->setTargetPersonaId( $data['target_persona_id'] );
        $conversation->setTargetRealmId( $data['target_realm_id'] );
        $conversation->setSourceAlternativeId( $data['source_alternative_id'] );
        $conversation->setTargetAlternativeId( $data['target_alternative_id'] );
        $conversation->setAnonymous( $data['anonymous'] );
        $conversation->setUpdated( $data['updated'] );

        return $conversation;
    }

    public function get_messages(): array {
        if( ! isset( $this->chat_id ) ) {
            return [];
        }

        $stmt = $this->db->prepare( "SELECT * FROM conversation_message WHERE `conversation_id` = :chat_id ORDER BY created asc" );
        $stmt->execute( [
            ":chat_id" => $this->chat_id,
        ] );

        return $stmt->fetchAll( PDO::FETCH_ASSOC );
    }

    public function add_message( $message ): int {
        if (!$this->chat_id) {
            throw new Exception("Can't add a message without an id");
        }
        $stmt = $this->db->prepare( "
            INSERT INTO conversation_message (
                `role`,
                `content`,
                `conversation_id`
            ) VALUES (
                :the_role,
                :the_content,
                :the_conversation
            )"
        );
        $stmt->execute( [
            ":the_role" => $message['role'],
            ":the_content" => $message['content'],
            ":the_conversation" => $this->chat_id
        ] );

        return $this->db->lastInsertId();
    }

    public function edit_message( $messageId, $message ) {
        $stmt = $this->db->prepare( "UPDATE conversation_message SET original_content = IFNULL(original_content, content), content = :content WHERE id = :message_id LIMIT 1" );
        $stmt->execute( [
            ":content" => $message,
            ":message_id" => $messageId,
        ] );
    }

    public function delete_message( $messageId, bool $following ) {
        $stmt = null;
        if ($following) {
            $stmt = $this->db->prepare( "DELETE FROM conversation_message WHERE conversation_id = :chat_id AND id >= :message_id" );
        } else {
            $stmt = $this->db->prepare( "DELETE FROM conversation_message WHERE conversation_id = :chat_id AND id = :message_id LIMIT 1" );
        }
        $stmt->execute( [
            ":chat_id" => $this->chat_id,
            ":message_id" => $messageId
        ] );
    }

    public function updateSystem($prompt): bool {
        $stmt = $this->db->prepare( "UPDATE conversation_message SET original_content = IFNULL(original_content, content), content = :content WHERE conversation_id = :chat_id AND role = 'system' LIMIT 1" );
        $stmt->execute( [
            ":content" => $prompt,
            ":chat_id" => $this->chat_id,
        ] );
        return $stmt->rowCount() === 1;
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
            $stmt = $this->db->prepare( "
                INSERT INTO conversation (
                    title,
                    user_id,
                    target_persona_id,
                    target_realm_id,
                    source_persona_id,
                    target_alternative_id,
                    source_alternative_id,
                    anonymous
                ) VALUES (
                    :title,
                    :user,
                    :target,
                    :realm,
                    :source,
                    :targetAlt,
                    :sourceAlt,
                    :anonymous
                )"
            );

            $stmt->execute( [
                ":title" => $this->title,
                ":user" => $this->userId,
                ":target" => $this->targetPersonaId,
                ":realm" => $this->targetRealmId,
                ":source" => $this->sourcePersonaId,
                ":targetAlt" => $this->targetAlternativeId,
                ":sourceAlt" => $this->sourceAlternativeId,
                ":anonymous" => $this->anonymous ? 1 : 0
            ] );

            $this->chat_id = $this->db->lastInsertId();
        } else {
            $stmt = $this->db->prepare( "UPDATE conversation SET title = :title WHERE id = :chat_id LIMIT 1" );
            $stmt->execute( [
                ":title" => $this->title,
                ":chat_id" => $this->chat_id,
            ] );
        }

        return $this->chat_id;
    }

    public function resume(): void {
        $stmt = $this->db->prepare( "UPDATE conversation SET access_count = access_count + 1 WHERE id = :chat_id LIMIT 1" );
        $stmt->execute( [":chat_id" => $this->chat_id] );
    }

    public function delete(): void {
        $stmt = $this->db->prepare( "DELETE FROM conversation_message WHERE conversation_id = :chat_id" );
        $stmt->execute([
            ":chat_id" => $this->chat_id,
        ]);

        $stmt = $this->db->prepare( "DELETE FROM conversation WHERE id = :chat_id LIMIT 1" );
        $stmt->execute([
            ":chat_id" => $this->chat_id,
        ]);
    }

    public function getData(): array {
        return array(
            "id" => $this->chat_id,
            "title" => $this->title,
            'source_persona_id' => $this->sourcePersonaId,
            'target_persona_id' => $this->targetPersonaId,
            'target_realm_id' => $this->targetRealmId,
            'user_id' => $this->userId,
            'source_alternative_id' => $this->sourceAlternativeId,
            'target_alternative_id' => $this->targetAlternativeId,
            'anonymous' => (bool)$this->anonymous,
            'updated' => $this->updated
        );
    }
}
