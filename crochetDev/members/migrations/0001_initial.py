# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Pattern'
        db.create_table('members_pattern', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(related_name='created_patterns', to=orm['auth.User'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=30)),
            ('instructions', self.gf('django.db.models.fields.CharField')(max_length=300)),
            ('likes', self.gf('django.db.models.fields.PositiveSmallIntegerField')(default=0)),
            ('date_created', self.gf('django.db.models.fields.DateTimeField')()),
            ('date_published', self.gf('django.db.models.fields.DateTimeField')(null=True)),
        ))
        db.send_create_signal('members', ['Pattern'])

        # Adding M2M table for field savers on 'Pattern'
        db.create_table('members_pattern_savers', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('pattern', models.ForeignKey(orm['members.pattern'], null=False)),
            ('user', models.ForeignKey(orm['auth.user'], null=False))
        ))
        db.create_unique('members_pattern_savers', ['pattern_id', 'user_id'])

        # Adding model 'Tag'
        db.create_table('members_tag', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('pattern', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['members.Pattern'])),
            ('content', self.gf('django.db.models.fields.CharField')(max_length=10)),
        ))
        db.send_create_signal('members', ['Tag'])

        # Adding model 'Connection'
        db.create_table('members_connection', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('followed', self.gf('django.db.models.fields.related.ForeignKey')(related_name='followers', to=orm['auth.User'])),
            ('follower', self.gf('django.db.models.fields.related.ForeignKey')(related_name='following', to=orm['auth.User'])),
        ))
        db.send_create_signal('members', ['Connection'])

        # Adding model 'Message'
        db.create_table('members_message', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('pattern', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['members.Pattern'], null=True)),
            ('sender', self.gf('django.db.models.fields.related.ForeignKey')(related_name='sent', to=orm['auth.User'])),
            ('receiver', self.gf('django.db.models.fields.related.ForeignKey')(related_name='received', to=orm['auth.User'])),
            ('content', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('date_sent', self.gf('django.db.models.fields.DateTimeField')()),
        ))
        db.send_create_signal('members', ['Message'])

        # Adding model 'Stitch'
        db.create_table('members_stitch', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('user', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['auth.User'])),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=25)),
            ('name_short', self.gf('django.db.models.fields.CharField')(max_length=5)),
            ('instructions', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('height', self.gf('django.db.models.fields.PositiveSmallIntegerField')()),
            ('width', self.gf('django.db.models.fields.PositiveSmallIntegerField')()),
        ))
        db.send_create_signal('members', ['Stitch'])


    def backwards(self, orm):
        # Deleting model 'Pattern'
        db.delete_table('members_pattern')

        # Removing M2M table for field savers on 'Pattern'
        db.delete_table('members_pattern_savers')

        # Deleting model 'Tag'
        db.delete_table('members_tag')

        # Deleting model 'Connection'
        db.delete_table('members_connection')

        # Deleting model 'Message'
        db.delete_table('members_message')

        # Deleting model 'Stitch'
        db.delete_table('members_stitch')


    models = {
        'auth.group': {
            'Meta': {'object_name': 'Group'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        'auth.permission': {
            'Meta': {'ordering': "('content_type__app_label', 'content_type__model', 'codename')", 'unique_together': "(('content_type', 'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        'auth.user': {
            'Meta': {'object_name': 'User'},
            'date_joined': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'email': ('django.db.models.fields.EmailField', [], {'max_length': '75', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '30', 'blank': 'True'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': "orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'}),
            'username': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '30'})
        },
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'members.connection': {
            'Meta': {'object_name': 'Connection'},
            'followed': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'followers'", 'to': "orm['auth.User']"}),
            'follower': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'following'", 'to': "orm['auth.User']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        'members.message': {
            'Meta': {'object_name': 'Message'},
            'content': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'date_sent': ('django.db.models.fields.DateTimeField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'pattern': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['members.Pattern']", 'null': 'True'}),
            'receiver': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'received'", 'to': "orm['auth.User']"}),
            'sender': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'sent'", 'to': "orm['auth.User']"})
        },
        'members.pattern': {
            'Meta': {'object_name': 'Pattern'},
            'date_created': ('django.db.models.fields.DateTimeField', [], {}),
            'date_published': ('django.db.models.fields.DateTimeField', [], {'null': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'instructions': ('django.db.models.fields.CharField', [], {'max_length': '300'}),
            'likes': ('django.db.models.fields.PositiveSmallIntegerField', [], {'default': '0'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '30'}),
            'savers': ('django.db.models.fields.related.ManyToManyField', [], {'related_name': "'saved_patterns'", 'symmetrical': 'False', 'to': "orm['auth.User']"}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'created_patterns'", 'to': "orm['auth.User']"})
        },
        'members.stitch': {
            'Meta': {'object_name': 'Stitch'},
            'height': ('django.db.models.fields.PositiveSmallIntegerField', [], {}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'instructions': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '25'}),
            'name_short': ('django.db.models.fields.CharField', [], {'max_length': '5'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['auth.User']"}),
            'width': ('django.db.models.fields.PositiveSmallIntegerField', [], {})
        },
        'members.tag': {
            'Meta': {'object_name': 'Tag'},
            'content': ('django.db.models.fields.CharField', [], {'max_length': '10'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'pattern': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['members.Pattern']"})
        }
    }

    complete_apps = ['members']