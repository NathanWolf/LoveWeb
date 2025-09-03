create schema love;
use love;

create user 'love'@'127.0.0.1' identified by 'super-secure-password';
grant select ON love.* to 'love'@'127.0.0.1';
grant update,insert ON love.user to 'love'@'127.0.0.1';
grant update,insert ON love.user_property to 'love'@'127.0.0.1';
grant update,insert,delete ON love.conversation to 'love'@'127.0.0.1';
grant update,insert,delete ON love.conversation_message to 'love'@'127.0.0.1';
grant update,insert,delete ON love.user_token to 'love'@'127.0.0.1';
grant insert ON love.dressup_outfit to 'love'@'127.0.0.1';
grant update,insert,delete ON love.user_dressup_outfit to 'love'@'127.0.0.1';

create user 'love_admin'@'127.0.0.1' identified by 'super-duper-secure-password';
grant all privileges ON love.* to 'love_admin'@'127.0.0.1';

create table user
(
    id VARCHAR(40) DEFAULT (uuid()),
    email varchar(255) not null,
    first_name varchar(255) null,
    last_name varchar(255) null,
    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    password_hash varchar(255) not null,
    admin bool default false,
    token varchar(255) null,

    constraint user_pk
        primary key (id)
);

alter table user
    add column middle_name varchar(255) null;

alter table user
    add column chat JSON null;

alter table user
    add column preferences JSON null;

CREATE TABLE user_token
(
    user_id VARCHAR(40) NOT NULL,
    token varchar(255) not null,
    remote_address varchar(32) not null,

    constraint user_token_pk
        primary key (user_id, token)
);

alter table user
    drop column token;

ALTER table user_token
    add created           timestamp not null default CURRENT_TIMESTAMP,
    add updated           timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP
;

CREATE TABLE user_property
(
    user_id VARCHAR(64) NOT NULL,
    property_id VARCHAR(64) NOT NULL,
    value varchar(255) NOT NULL,

    constraint user_property_pk
        primary key (user_id, property_id),

    foreign key (user_id)
        references user(id)
        on delete cascade
        on update cascade
);

create table tier_list
(
    id VARCHAR(255) NOT NULL,
    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    name varchar(255) NOT NULL,

    constraint tier_list_pk
        primary key (id)
);

create table tier
(
    id VARCHAR(255) NOT NULL,
    tier_list_id VARCHAR(255) NOT NULL,
    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(64) NOT NULL,
    dark boolean default false,

    constraint tier_pk
        primary key (id, tier_list_id),

    foreign key (tier_list_id)
        references tier_list(id)
        on delete cascade
        on update cascade
);

alter table tier
    add priority int not null default 0;

alter table tier
    add name_singular varchar(255);

alter table tier
    add description text null;

alter table tier
    add dark_color VARCHAR(64) NULL,
    add dark_dark boolean null;

create table persona
(
    id VARCHAR(64) NOT NULL,
    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    first_name varchar(255) null,
    last_name varchar(255) null,
    chat JSON null,
    portrait JSON null,
    backstory LONGTEXT null,

    constraint persona_pk
        primary key (id)
);

alter table persona
    add column description LONGTEXT null;

alter table persona
    add column image JSON null;

alter table persona
    add column middle_name varchar(255) null;

alter table persona
    add column nick_name varchar(255) null;

alter table persona
    add column hidden boolean default false not null;

alter table persona
    add column notes text null;

alter table persona
    add birth_name varchar(255) null,
    add birth_realm varchar(255) null,
    add home_realm varchar(255) null;

alter table persona
    add column spoiler boolean default false not null;

alter table persona
    add column first_name_references bigint default null;

alter table persona
    add column base_id VARCHAR(64) NULL,
    add column variant_name VARCHAR(64) NULL,
    add foreign key (base_id)
    references persona(id)
    on delete cascade
    on update cascade;

create table property
(
    id VARCHAR(64) NOT NULL,
    name varchar(255) NOT NULL,

    constraint property_pk
        primary key (id)
);

insert into property (id, name) values ('sexuality', 'Sexuality');
insert into property (id, name) values ('species', 'Species');
insert into property (id, name) values ('pronouns', 'Pronouns');
insert into property (id, name) values ('gender', 'Gender');
insert into property (id, name) values ('title', 'Title');

alter table property
    add column question text null,
    add column priority int default 0,
    add column plural boolean default false;

alter table property
    add hidden boolean default 0 not null;

CREATE TABLE persona_property
(
    persona_id VARCHAR(64) NOT NULL,
    property_id VARCHAR(64) NOT NULL,
    value varchar(255) NOT NULL,

    constraint persona_property_pk
        primary key (persona_id, property_id),

    foreign key (persona_id)
        references persona(id)
        on delete cascade
        on update cascade,

    foreign key (property_id)
        references property(id)
        on delete cascade
        on update cascade
);

create table relationship
(
    id VARCHAR(64) NOT NULL,
    name varchar(255) NOT NULL,

    constraint relationship_id
        primary key (id)
);

alter table relationship
    add inverse_relationship_id varchar(64) null;

alter table relationship
    add constraint relationship_inverse_relationship_id_fk
        foreign key (inverse_relationship_id) references relationship (id);

insert into property (id, name) values ('partner', 'Partner');
insert into property (id, name) values ('ex_partner', 'Ex-Partner');
insert into property (id, name) values ('parent', 'Parent');
insert into property (id, name) values ('child', 'Child');
insert into property (id, name) values ('sibling', 'Sibling');
insert into property (id, name) values ('employer', 'Boss');
insert into property (id, name) values ('employee', 'Employee');
insert into property (id, name) values ('creator', 'Creator');
insert into property (id, name) values ('split', 'Split');
insert into property (id, name) values ('birth_parent', 'Birth Parent');
insert into property (id, name) values ('creation', 'Creation');
insert into property (id, name) values ('experiment', 'Experiment');
insert into property (id, name) values ('experimenter', 'Experimenter');

CREATE TABLE persona_relationship
(
    persona_id VARCHAR(64) NOT NULL,
    relationship_id VARCHAR(64) NOT NULL,
    related_persona_id VARCHAR(64) NOT NULL,

    constraint persona_relationship_pk
        primary key (persona_id, relationship_id, related_persona_id),

    foreign key (persona_id)
        references persona(id)
        on delete cascade
        on update cascade,

    foreign key (relationship_id)
        references relationship(id)
        on delete cascade
        on update cascade,

    foreign key (related_persona_id)
        references persona(id)
        on delete cascade
        on update cascade
);

CREATE TABLE persona_tier
(
    persona_id VARCHAR(64) NOT NULL,
    tier_list_id VARCHAR(64) NOT NULL,
    tier_id varchar(255) NOT NULL,

    constraint persona_property_pk
        primary key (persona_id, tier_list_id),

    foreign key (persona_id)
        references persona(id)
        on delete cascade
        on update cascade,

    foreign key (tier_list_id)
        references tier_list(id)
        on delete cascade
        on update cascade,

    foreign key (tier_list_id, tier_id)
        references tier(tier_list_id, id)
        on delete cascade
        on update cascade
);

alter table persona_tier
    add priority int not null default 0;

create table quiz
(
    id VARCHAR(64) NOT NULL,
    name varchar(255) NOT NULL,

    constraint quiz_pk
        primary key (id)
);

create table quiz_question
(
    id int auto_increment not null,
    quiz_id varchar(64) not null,
    question TEXT NOT NULL,
    explanation TEXT NULL,

    constraint quiz_question_pk
        primary key (id),

    foreign key (quiz_id)
        references quiz(id)
        on delete cascade
        on update cascade
);

create table quiz_answer
(
    id int auto_increment not null,
    quiz_question_id int not null,
    answer TEXT NOT NULL,
    correct boolean not null default false,

    constraint quiz_answer_pk
        primary key (id),

    foreign key (quiz_question_id)
        references quiz_question(id)
        on delete cascade
        on update cascade
);

CREATE TABLE persona_image
(
    persona_id VARCHAR(64) NOT NULL,
    image_id VARCHAR(64) NOT NULL,

    constraint persona_image_pk
        primary key (persona_id, image_id),

    foreign key (persona_id)
        references persona(id)
        on delete cascade
        on update cascade,

    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,

    priority int not null default 0,
    tags varchar(255) NOT NULL DEFAULT '',
    title varchar(255) NULL,
    description TEXT NOT NULL,
    drawn date NULL,
    version int default 1 not null,
    metadata JSON NULL,
    width int null,
    height int null
);

ALTER TABLE persona_image
    ADD hidden boolean not null default false,
    ADD next_image_id VARCHAR(64),
    ADD previous_image_id VARCHAR(64),
    ADD offset_x int not null default 0,
    ADD offset_y int not null default 0
    ;

CREATE TABLE month
(
    id int not null primary key,
    name varchar(255) not null,

    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP
);

CREATE TABLE timeline_event
(
    id int auto_increment not null primary key,
    name varchar(255) not null,
    description text not null default '',
    day int not null,
    month int not null,
    year bigint not null,
    priority int not null default 0,

    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,

    foreign key (month)
        references month(id)
        on delete restrict
        on update cascade
);

create index timeline_event_chronological_index
    on timeline_event (year, month, day, priority);

alter table timeline_event
    add importance varchar(32) default 'major' not null,
    add spoiler boolean default false not null;

alter table timeline_event
    add end_day int not null,
    add end_month int not null,
    add end_year bigint not null;

-- Data updates follow

UPDATE persona_tier
    JOIN (
        select persona_id, tier_list_id, tier_id,
               row_number() over (partition by tier_list_id, tier_id) as row,
               count(*) over (partition by tier_list_id, tier_id) as tot
        from persona_tier
    ) priorities
    ON priorities.persona_id = persona_tier.persona_id
       and priorities.tier_list_id = persona_tier.tier_list_id
       and priorities.tier_id = persona_tier.tier_id
SET persona_tier.priority = (priorities.tot - priorities.row) * 100;

UPDATE tier
    JOIN (
        select id, tier_list_id,
               row_number() over (partition by tier_list_id) as row,
               count(*) over (partition by tier_list_id) as tot
        from tier
    ) priorities
    ON priorities.id = tier.id and priorities.tier_list_id = tier.tier_list_id
SET tier.priority = (priorities.tot - priorities.row) * 100;

CREATE TABLE conversation
(
    id                int not null auto_increment,
    created           timestamp not null default CURRENT_TIMESTAMP,
    updated           timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    title             text        null,
    user_id           VARCHAR(40) not null,
    target_persona_id varchar(64) not null,
    source_persona_id varchar(64) null,

    constraint conversation_pk
        primary key (id),

    foreign key (user_id)
        references user(id)
        on delete cascade
        on update cascade,

    foreign key (target_persona_id)
        references persona(id)
        on delete cascade
        on update cascade,

    foreign key (source_persona_id)
        references persona(id)
        on delete cascade
        on update cascade
);

alter table conversation
    add target_alternative_id int null,
    add source_alternative_id int null,
    add anonymous boolean not null default false;

alter table conversation
    add access_count int not null default 0;

alter table conversation
    add target_realm_id VARCHAR(40) null,
    add target_realm_alternative_id int null;

alter table conversation
    add constraint conversation_realm_id_fk
        foreign key (target_realm_id) references realm (id)
            on update cascade on delete cascade;

alter table conversation
    modify target_persona_id varchar(64) null;

CREATE TABLE conversation_message
(
    id                int not null auto_increment,
    conversation_id   int not null,
    created           timestamp not null default CURRENT_TIMESTAMP,
    updated           timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    content           LONGTEXT not null,
    original_content  LONGTEXT null,
    role              varchar(64),

    constraint conversation_message_pk
        primary key (id),

    foreign key (conversation_id)
        references conversation(id)
        on delete cascade
        on update cascade
);

create index conversation_message_conversation_id_role_index
    on conversation_message (conversation_id, role)
    comment 'For looking up the system message';

create table realm
(
    id VARCHAR(40) not null,
    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    name varchar(255) null,
    description varchar(255) null,

    constraint realm_pk
        primary key (id)
);

alter table realm
    add column chat JSON null;

create table realm_property_type
(
    id VARCHAR(40) not null,
    name varchar(255) NOT NULL,

    constraint realm_property_type_pk
        primary key (id)
);

alter table realm_property_type
    add column priority int default 0,
    add column plural boolean default false;

insert into realm_property_type (id, name) values ('magic', 'Magic Policy');
insert into realm_property_type (id, name) values ('politics', 'Politics');
insert into realm_property_type (id, name) values ('color', 'Color Theme');

CREATE TABLE realm_property
(
    realm_id VARCHAR(64) NOT NULL,
    realm_property_type_id VARCHAR(64) NOT NULL,
    value varchar(255) NOT NULL,

    constraint realm_property_pk
        primary key (realm_id, realm_property_type_id),

    foreign key (realm_id)
        references realm(id)
        on delete cascade
        on update cascade,

    foreign key (realm_property_type_id)
        references realm_property_type(id)
        on delete cascade
        on update cascade
);

CREATE TABLE realm_persona
(
    realm_id VARCHAR(64) NOT NULL,
    persona_id VARCHAR(64) NOT NULL,
    title varchar(255) NOT NULL,

    constraint realm_persona_pk
        primary key (realm_id, persona_id),

    foreign key (realm_id)
        references realm(id)
        on delete cascade
        on update cascade,

    foreign key (persona_id)
        references persona(id)
        on delete cascade
        on update cascade
);

CREATE TABLE realm_image
(
    realm_id VARCHAR(64) NOT NULL,
    image_id VARCHAR(64) NOT NULL,

    constraint realm_image_pk
        primary key (realm_id, image_id),

    foreign key (realm_id)
        references realm(id)
        on delete cascade
        on update cascade,

    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,

    priority int not null default 0,
    tags varchar(255) NOT NULL DEFAULT '',
    title varchar(255) NULL,
    description TEXT NOT NULL,
    drawn date NULL,
    version int default 1 not null,
    metadata JSON NULL,
    width int null,
    height int null
);

INSERT INTO realm_image (realm_id, image_id, title, description, width, height)
VALUES ('overrealms', 'overview', 'Overview', 'An overview of this realm',2388, 1668);

INSERT INTO realm_image (realm_id, image_id, title, description, width, height)
VALUES ('underrealms', 'overview', 'Overview', 'An overview of this realm',2388, 1668);

INSERT INTO realm_image (realm_id, image_id, title, description, width, height)
VALUES ('shadowrealms', 'overview', 'Overview', 'An overview of this realm',2388, 1668);

INSERT INTO realm_image (realm_id, image_id, title, description, width, height)
VALUES ('midlands', 'overview', 'Overview', 'An overview of this realm',2388, 1668);

INSERT INTO realm_image (realm_id, image_id, title, description, width, height)
VALUES ('afterrealms', 'overview', 'Overview', 'An overview of this realm',2388, 1668);

CREATE TABLE persona_mini (
      persona_id VARCHAR(64) NOT NULL,

      constraint persona_mini_pk
          primary key (persona_id),

      foreign key (persona_id)
          references persona(id)
          on delete cascade
          on update cascade
);

CREATE TABLE dressup_category
(
    id   VARCHAR(64)  NOT NULL,
    name VARCHAR(255) NOT NULL,
    constraint dressup_category_pk
        primary key (id)
);

alter table dressup_category
    add min_items int default 1 not null,
    add max_items int default 1 not null,
    add probability float default 1 not null,
    add probability_ratio float default 1 not null;

alter table dressup_category
    add priority int default 1 not null;

alter table dressup_category
    add linked_category_id VARCHAR(64) null,
    add foreign key (linked_category_id)
        references dressup_category(id)
        on delete cascade
        on update set null;

CREATE TABLE persona_dressup (
    persona_id VARCHAR(64) NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,

    constraint persona_dressup_pk
      primary key (persona_id),

    foreign key (persona_id)
      references persona(id)
      on delete cascade
      on update cascade
);

alter table persona_dressup
    add default_outfit JSON null;

CREATE TABLE persona_dressup_item (
    persona_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    image_id VARCHAR(64) NOT NULL,
    title VARCHAR(64) NOT NULL,
    description VARCHAR(255) NOT NULL DEFAULT '',
    layer int NOT NULL DEFAULT 0,

    constraint persona_dressup_item_pk
        primary key (persona_id, category_id, image_id),

    foreign key (persona_id)
        references persona(id)
        on delete cascade
        on update cascade,

    foreign key (category_id)
        references dressup_category(id)
        on delete cascade
        on update cascade
);

alter table persona_dressup_item
    add linked_image_id VARCHAR(64) null;

alter table persona_dressup_item
    add permanent boolean not null default false;

CREATE TABLE dressup_outfit (
    id char(40) DEFAULT (uuid()),
    hash char(64) NOT NULL,
    hash_algorithm char(64) NOT NULL,
    version int NOT NULL,
    persona_id VARCHAR(64) NOT NULL,
    outfit JSON NOT NULL,

    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,

    foreign key (persona_id)
        references persona(id)
        on delete cascade
        on update cascade,

     constraint dressup_outfits_pk
         primary key (id)
);

create index dressup_outfit_hash_index
    on dressup_outfit (hash);

CREATE TABLE user_dressup_outfit (
    user_id varchar(40) NOT NULL,
    outfit_id char(40),
    share_count int not null default(1),

    created timestamp not null default CURRENT_TIMESTAMP,
    updated timestamp not null default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,

    constraint user_dressup_outfit_pk
        primary key (user_id, outfit_id)
);

ALTER TABLE user_dressup_outfit
    ADD title varchar(255) NULL;

CREATE TABLE persona_dressup_category
(
    persona_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64) NOT NULL,

    min_items int null,
    max_items int null,
    probability float null,
    probability_ratio float null,
    priority int null,
    linked_category_id VARCHAR(64) null,

    constraint persona_dressup_category_pk
        primary key (persona_id, category_id),

    foreign key (persona_id)
        references persona(id)
        on delete cascade
        on update cascade,

    foreign key (category_id)
        references dressup_category(id)
        on delete cascade
        on update cascade,

    foreign key (linked_category_id)
        references dressup_category(id)
        on delete cascade
        on update set null
);
