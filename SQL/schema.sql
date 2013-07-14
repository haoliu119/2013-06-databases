/* >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 *  Scripts Exported from MySQL WorkBench
 *
 *  Execute this file from the command line by typing:
 *    mysql < schema.sql
 *  to create the database and the tables.
 * <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< */

CREATE DATABASE chat;

USE chat;

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(45) NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_name_UNIQUE` (`user_name`),
  UNIQUE KEY `user_id_UNIQUE` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL AUTO_INCREMENT,
  `message` varchar(140) DEFAULT NULL,
  `created_at` varchar(100) NOT NULL,
  `user_id` int(11) NOT NULL,
  `chat_room_id` int(11) NOT NULL,
  PRIMARY KEY (`message_id`),
  UNIQUE KEY `chat_id_UNIQUE` (`message_id`),
  KEY `user_id_idx` (`user_id`),
  KEY `chat_room_id_idx` (`chat_room_id`),
  CONSTRAINT `chat_room_id` FOREIGN KEY (`chat_room_id`) REFERENCES `chat_rooms` (`chat_room_id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `chat_rooms` (
  `chat_room_id` int(11) NOT NULL AUTO_INCREMENT,
  ` chat_room_name` varchar(45) NOT NULL,
  `created_at` varchar(100) NOT NULL,
  `created_by` int(11) NOT NULL,
  PRIMARY KEY (`chat_room_id`),
  UNIQUE KEY `chat_room_id_UNIQUE` (`chat_room_id`),
  UNIQUE KEY ` chat_room_name_UNIQUE` (` chat_room_name`),
  KEY `created_by_idx` (`created_by`),
  CONSTRAINT `created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE `friends` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `host_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  KEY `friend_id_idx` (`friend_id`),
  KEY `host_id_idx` (`host_id`),
  CONSTRAINT `host_id` FOREIGN KEY (`host_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `friend_id` FOREIGN KEY (`friend_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

