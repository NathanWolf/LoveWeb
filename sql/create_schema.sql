create schema love;
use love;
create user love;
create user 'love'@'localhost' identified by 'l0veu5er';
grant select ON love.* to 'love'@'localhost';
grant update,insert ON love.user to 'love'@'localhost';

create user 'love_admin'@'localhost' identified by 'l0ve4dm!n';
grant all privileges ON love.* to 'love_admin'@'localhost';

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

    constraint user_pk
        primary key (id)
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
insert into property (id, name) values ('title', 'Title');

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