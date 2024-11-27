<?php
interface ConversationInterface
{
    /**
     * @return array<self>
     */
    public function get_chats(): array;

    public function find( int $chat_id  ): self|false;

    public function get_messages();

    public function add_message( $message ): int;

    public function edit_message( $messageId, $message );

    public function set_id( string $id );

    public function set_title( string $title );

    public function get_id();

    public function get_title();

    public function save(): int;

    public function delete(): void;

    public function setUserId(string|null $userId): void;

    public function setTargetPersonaId(string|null $targetPersonaId): void;

    public function setSourcePersonaId(string|null $sourcePersonaId): void;

    public function setSourceAlternativeId(int|null $sourceAlternativeId): void;

    public function setTargetAlternativeId(int|null $targetAlternativeId): void;

    public function setAnonymous(bool $anonymous);

    public function getData(): array;
}
