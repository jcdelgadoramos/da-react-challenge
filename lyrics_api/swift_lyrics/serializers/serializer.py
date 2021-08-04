from drf_yasg import openapi
from rest_framework import serializers

from swift_lyrics.models import Lyric, Song, Album, Artist


class BaseArtistSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artist
        fields = ["id", "name", "first_year_active"]


class BaseAlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = ["id", "name", "year"]


class CompleteAlbumSerializer(BaseAlbumSerializer):

    artist = BaseArtistSerializer()

    class Meta:
        model = BaseAlbumSerializer.Meta.model
        fields = BaseAlbumSerializer.Meta.fields + ["artist"]


class BaseSongSerializer(serializers.ModelSerializer):
    class Meta:
        model = Song
        fields = ["id", "name"]


class LyricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lyric
        fields = ["id", "text", "votes", "upvotes", "downvotes"]
        read_only_fields = ["votes", "upvotes", "downvotes"]


class ArtistDetailSerializer(BaseArtistSerializer):
    albums = BaseAlbumSerializer(many=True, read_only=True)

    class Meta(BaseArtistSerializer.Meta):
        fields = BaseArtistSerializer.Meta.fields + ["albums"]


class AlbumCreationSerializer(BaseAlbumSerializer):
    artist = serializers.DjangoModelField()

    class Meta(BaseAlbumSerializer.Meta):
        fields = BaseAlbumSerializer.Meta.fields + ["artist"]
        extra_kwargs = {
            "year": {"required": True},
            "artist": {"required": True},
        }

    def to_internal_value(self, data):
        artist = self.initial_data.get("artist", None)
        if isinstance(artist, dict):
            name = artist.get("name", None)
            if not name:
                raise serializers.ValidationError(
                    dict(
                        artist=dict(
                            name=[
                                "This field is required",
                            ]
                        )
                    )
                )
            year = artist.get("first_year_active", None)
            if not year and not Artist.objects.filter(name=name).exists():
                raise serializers.ValidationError(
                    dict(
                        artist=dict(
                            first_year_active=[
                                "This field is required",
                            ]
                        )
                    )
                )
            artist_instance, _ = Artist.objects.get_or_create(
                name=name, defaults=dict(first_year_active=year)
            )
            data["artist"] = artist_instance.id

        return super().to_internal_value(data)

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response["artist"] = BaseArtistSerializer(instance.artist).data
        return response


class AlbumDetailSerializer(BaseAlbumSerializer):
    songs = BaseSongSerializer(many=True, read_only=True)
    artist = BaseArtistSerializer()

    class Meta(BaseAlbumSerializer.Meta):
        fields = BaseAlbumSerializer.Meta.fields + ["songs", "artist"]


class SongSerializer(BaseSongSerializer):
    album = CompleteAlbumSerializer()

    class Meta(BaseSongSerializer.Meta):
        fields = BaseSongSerializer.Meta.fields + ["album"]


class SongDetailSerializer(SongSerializer):
    lyrics = LyricSerializer(many=True, read_only=True)

    class Meta(SongSerializer.Meta):
        fields = SongSerializer.Meta.fields + ["lyrics"]


class LyricDetailSerializer(LyricSerializer):
    song = serializers.DjangoModelField()
    album = BaseAlbumSerializer(source="song.album", read_only=True)
    artist = BaseArtistSerializer(source="song.album.artist", read_only=True)

    def to_internal_value(self, data):
        song = self.initial_data.get("song", None)
        if isinstance(song, int):
            # If song_id, then the album and song already exists,
            # just fetch them from datastore
            pass
        elif isinstance(song, dict):
            # If album_id, then album already exists - just fetch,
            # then handle create/fetch song
            album_id = song.get("album", None)
            album = None
            if not album_id:
                raise serializers.ValidationError(
                    dict(
                        album=[
                            "This field is required",
                        ]
                    )
                )
            elif album_id and isinstance(album_id, int):
                albums = Album.objects.filter(id=album_id)
                if albums.exists():
                    album = albums.first()
                else:
                    raise serializers.ValidationError(
                        dict(
                            album=[
                                (
                                    f"Invalid pk '\"{album_id}\"' - "
                                    "object does not exist."
                                ),
                            ]
                        )
                    )
            else:
                raise serializers.ValidationError(
                    dict(
                        album=[
                            "A valid integer is required.",
                        ]
                    )
                )
            song_name = song.get("name", None)
            if song_name:
                song, _ = Song.objects.get_or_create(
                    name=song_name, album=album, defaults=dict()
                )
                data["song"] = song.id
            else:
                raise serializers.ValidationError(
                    dict(
                        song=dict(
                            name=[
                                "This field is required",
                            ]
                        )
                    )
                )
        else:
            raise serializers.ValidationError(
                dict(
                    song=[
                        "This field is required",
                    ]
                )
            )

        return super().to_internal_value(data)

    def create(self, validated_data):
        lyric = Lyric(**validated_data)
        lyric.save()
        return lyric

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response["song"] = BaseSongSerializer(instance.song).data
        return response

    class Meta(LyricSerializer.Meta):
        fields = LyricSerializer.Meta.fields + ["song", "album", "artist"]
        read_only_fields = LyricSerializer.Meta.read_only_fields + ["artist"]
