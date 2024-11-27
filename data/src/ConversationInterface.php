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

    public function delete_message( $messageId, bool $following );

    public function set_id( string $id );

    public function set_title( string $title );

    public function get_id();

    public function get_title();

    public function save(): int;

    public function delete(): void;

    public function setUserId(string|null $userId): void;

    public function getUserId(): string|null;

    public function setTargetPersonaId(string|null $targetPersonaId): void;

    public function setSourcePersonaId(string|null $sourcePersonaId): void;

    public function setSourceAlternativeId(int|null $sourceAlternativeId): void;

    public function setTargetAlternativeId(int|null $targetAlternativeId): void;

    public function getTargetPersonaId(): string|null;

    public function getSourcePersonaId(): string|null;

    public function getSourceAlternativeId(): int|null;

    public function getTargetAlternativeId(): int|null;

    public function getAnonymous(): bool;

    public function setAnonymous(bool $anonymous);

    public function getData(): array;

    public function updateSystem($prompt): bool;

    public function resume(): void;
}
